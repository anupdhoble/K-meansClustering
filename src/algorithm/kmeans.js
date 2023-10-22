// kmeans.js
const ml = require('ml-kmeans');

function performKMeansClustering(rgbMatrix, k) {
  const { clusters, centroids } = ml.kmeans(rgbMatrix, k);

  return { clusters, centroids };
}

module.exports = { performKMeansClustering };
