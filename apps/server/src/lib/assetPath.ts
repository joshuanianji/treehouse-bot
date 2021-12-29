import path from 'path'

// Docker copies over the assets from the host machine to the container.
// so the assetPath of apps/server/assets is still valid
// hmm, feels hacky though.
export const assetPath = path.join(__dirname, '/../../assets');
console.log(assetPath)