import FormData from 'form-data'
import { Readable } from 'stream'
import axios from 'axios'

export const pinFileToPinata = async (jwt, content, filename, debug = false) => {
    return new Promise(async response => {
        try {
            if (debug) {
                console.log('Uploading ' + filename + '..')
            }
            const stream = Readable.from(content);
            const formData = new FormData();
            formData.append("file", stream, { filename: filename });
            formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }))
            formData.append("pinataMetadata", JSON.stringify({ name: "[IPDB] " + filename }))
            const uploaded = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    maxBodyLength: 'Infinity',
                    headers: {
                        "Content-Type": "multipart/form-data; boundary=" + formData._boundary,
                        "Authorization": "Bearer " + jwt
                    },
                }
            )
            if (uploaded.data.IpfsHash !== undefined) {
                response(uploaded.data.IpfsHash)
            }
        } catch (e) {
            if (debug) {
                console.log('Pinata upload failed')
            }
            response(false)
        }
    })
}