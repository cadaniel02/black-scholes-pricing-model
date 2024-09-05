import JSZip from 'jszip';

export async function getHeatmaps(data) {
    try {
        const response = await fetch('http://127.0.0.1:8000/generate-heatmaps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(data)
        });
        const blob = await response.blob();
        const jszip = new JSZip();
        let zip;
        try {
            zip = await jszip.loadAsync(blob);
        } catch (error) {
            console.error('Error processing ZIP file:', error);
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
        console.error('Error fetching or processing heatmaps:', error);
    }
}