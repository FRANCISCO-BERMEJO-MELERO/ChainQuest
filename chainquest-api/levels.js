const levelMetadata = [
  { level: 1, minXP: 0, cid: "QmdjTD8Nt1qe1nLBdMsgsE64d8N4reL73ozeh1Dj6xG5pN" },
  { level: 2, minXP: 100, cid: "QmSsWYFK15KFkVAK9jmXwLsY5imPANBshRF9b9B1zVeXQk" },
  { level: 3, minXP: 200, cid: "QmUUjaNmCrm1U4kecptbPY5m9Xoh7RpXF35fCL8KHfXqV3" },
];

function getLevelFromXP(xp) {
  let result = levelMetadata[0];
  for (const entry of levelMetadata) {
    if (xp >= entry.minXP) result = entry;
    else break;
  }
  return result;
}

module.exports = { getLevelFromXP };
