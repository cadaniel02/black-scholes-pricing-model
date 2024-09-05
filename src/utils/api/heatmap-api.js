import JSZip from 'jszip';
import { API_URL } from '../../config'

function base64ToBuffer(str){
    str = window.atob(str); // creates a ASCII string
    var buffer = new ArrayBuffer(str.length),
        view = new Uint8Array(buffer);
    for(var i = 0; i < str.length; i++){
        view[i] = str.charCodeAt(i);
    }
    return buffer;
}

let jsonResponse
export async function getHeatmaps(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        jsonResponse = await response.json();
        const base64Data = jsonResponse.body;

        const buffer = base64ToBuffer(base64Data);

        const jszip = new JSZip();
        let zip;
        try {
            zip = await jszip.loadAsync(buffer);
        } catch (error) {
            console.error('Error generating heatmap', error);
            return
        }

        const images = [];
        for (const filename in zip.files) {
            if (zip.files[filename].name.endsWith('.png')) {
                const fileData = await zip.files[filename].async('blob');
                images.push({ filename, blob: fileData });
            }
        }
        return images;  // Return the array of image blobs
    } catch (error) {
        console.log("meow")
        console.error('Error fetching or processing heatmaps:', error);
    }
}