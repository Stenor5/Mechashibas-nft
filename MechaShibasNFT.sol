/*

  __  __           _             ____  _     _ _
 |  \/  | ___  ___| |__   __ _  / ___|| |__ (_) |__   __ _ ___
 | |\/| |/ _ \/ __| '_ \ / _` | \___ \| '_ \| | '_ \ / _` / __|
 | |  | |  __/ (__| | | | (_| |  ___) | | | | | |_) | (_| \__ \
 |_|  |_|\___|\___|_| |_|\__,_| |____/|_| |_|_|_.__/ \__,_|___/
 */
/**
 * @title A contract for Mecha Shibas
 * @author Jaxon
 * @notice NFT Minting
 */
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MechaShibasNFT is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;
    using SafeMath for uint256;
    using SafeMath for uint8;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.04 ether;
    uint256 public constant MINT_PRICE_PUBLIC = 0.06 ether;
    uint256 public constant MAX_MINT_PER_PRE = 3;
    uint256 public constant MAX_MINT_PER_PUB = 5;
    uint256 public constant PRESALE_SUPPLY = 3000;
    uint256 public totalSupply = 0;

    bool public saleStarted = false;
    bool public preSaleStarted = false;
    bool public revealed = false;

    string public baseExtension = ".json";
    string public baseURI;
    string public notRevealedURI;

    // Merkle Tree Root
    bytes32 private _merkleRoot;

    mapping(address => uint256) balanceOfAddress;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI,
        string memory _initNotRevealedURI
    ) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    /**
     * Address -> leaf for MerkleTree
     */
    function _leaf(address account) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    /**
     * Bool -> Verify WhiteList using MerkleTree
     */
    function verifyWhitelist(bytes32 leaf, bytes32[] memory proof)
        private
        view
        returns (bool)
    {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash < proofElement) {
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }
        }

        return computedHash == _merkleRoot;
    }

    /**
     * Presale mint for whitelist
     */
    function whitelistMint(uint256 _count, bytes32[] memory _proof)
        external
        payable
    {
        require(preSaleStarted, "MINT_NOT_STARTED");
        require(
            verifyWhitelist(_leaf(msg.sender), _proof) == true,
            "ADDRESS_INVALID"
        );

        uint256 ownerTokenCount = balanceOf(msg.sender);
        require(
            _count > 0 && ownerTokenCount + _count <= MAX_MINT_PER_PRE,
            "COUNT_INVALID"
        );
        require(totalSupply + _count <= MAX_SUPPLY, "MAX_SUPPLY_REACHED");
        require(totalSupply + _count <= PRESALE_SUPPLY, "PRESALE_REACHED");

        if (msg.sender != owner()) {
            require(msg.value >= MINT_PRICE * _count);
        }

        for (uint256 i = 1; i <= _count; i++) {
            _safeMint(msg.sender, totalSupply + i);
        }
        totalSupply += _count;
    }

    /**
     * Mint Single or Multiple NFT tokens
     */
    function mint(uint256 _count) public payable {
        require(saleStarted, "MINT_NOT_STARTED");
        uint256 ownerTokenCount = balanceOf(msg.sender);
        require(
            _count > 0 && ownerTokenCount + _count <= MAX_MINT_PER_PUB,
            "COUNT_INVALID"
        );
        require(totalSupply + _count <= MAX_SUPPLY, "MAX_SUPPLY_REACHED");

        if (msg.sender != owner()) {
            require(msg.value >= MINT_PRICE_PUBLIC * _count);
        }

        for (uint256 i = 1; i <= _count; i++) {
            _safeMint(msg.sender, totalSupply + i);
        }
        totalSupply += _count;
    }

    /**
     * Override tokenURI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");

        if (revealed == false) {
            return notRevealedURI;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "EMPTY_BALANCE");
        uint256 balance = address(this).balance;

        payable(msg.sender).transfer(balance);
    }

    function setSaleStarted(bool _hasStarted) external onlyOwner {
        require(saleStarted != _hasStarted, "SALE_STARTED_ALREADY_SET");
        saleStarted = _hasStarted;
    }

    function setPreSaleStarted(bool _hasStarted) external onlyOwner {
        require(preSaleStarted != _hasStarted, "PRESALE_STARTED_ALREADY_SET");
        preSaleStarted = _hasStarted;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function reveal() public onlyOwner {
        revealed = true;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedURI = _notRevealedURI;
    }

    function setMerkleRoot(bytes32 _merkleRootValue)
        external
        onlyOwner
        returns (bytes32)
    {
        _merkleRoot = _merkleRootValue;
        return _merkleRoot;
    }

    function maxMintAmount() external view returns (uint256) {
        if (preSaleStarted == true) {
            return MAX_MINT_PER_PRE;
        }
        return MAX_MINT_PER_PUB;
    }

    function pause() external onlyOwner {
        require(!paused(), "ALREADY_PAUSED");
        _pause();
    }

    function unpause() external onlyOwner {
        require(paused(), "ALREADY_UNPAUSED");
        _unpause();
    }
}
