import path from 'path'

// Docker copies over the assets from the host machine to the container.
// so /assets/ would be the same directory as the node app.
// hmm, feels hacky though.
export const assetPath = path.join(__dirname, `/${process.env.ASSET_PATH || '.'}/assets`);
console.log('[INFO]: Asset Path:', assetPath)
console.log('[INFO]: __dirname:', __dirname)