import { NFTStorage, Blob } from 'nft.storage'

const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || ''

class NFTStorageService {
  constructor() {
    this.client = new NFTStorage({ token: NFT_STORAGE_KEY })
  }

  async storeToken(files) {
    let cid

    if (files.length > 1) {
      cid = await this.client.storeDirectory(files)
    } else {
      cid = await this.client.storeBlob(new Blob(files))
    }

    return cid
  }

  async queryStatus(cid) {
    return await this.client.status(cid)
  }

  async delete(cid) {
    return await this.client.delete(cid)
  }
}

export default NFTStorageService
