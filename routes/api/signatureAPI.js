require('dotenv').config();
const express = require('express');
const WAValidator = require('wallet-address-validator');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const router = express.Router();

const verifyWhitelist = (address) => {
  // Wallet Validate
  const valid = WAValidator.validate(address, 'ETH');
  if (!valid) {
    console.log('Address INVALID');
    return false;
  }
  console.log('address: ', address);
  console.log('This is a valid address');

  let rawdata = fs.readFileSync(`./service/whitelist.json`);

  let whiteListArray = JSON.parse(rawdata);
  console.log('whitelistarray: ', whiteListArray);

  const leaves = whiteListArray.map((v) => keccak256(v));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  const leaf = keccak256(address);
  const proof = tree.getHexProof(leaf);
  const verified = tree.verify(proof, leaf, root);
  console.log('root: ', root);
  console.log('leaf: ', leaf);
  console.log('proof: ', proof);
  console.log('verified: ', verified);
  return { proof, leaf, verified };
};

// @route    GET signature/:address
// @access   Public
router.get('/:address', async (req, res) => {
  try {
    const result = verifyWhitelist(req.params.address);
    if (result === false) {
      return res.status(400).send({
        msg: 'Invalid Wallet Address',
        success: false,
      });
    }

    res.status(200).send({
      ...result,
      success: true,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'NFT not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
