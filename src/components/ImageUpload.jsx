import { useState } from "react"
import { performKMeansClustering } from "../algorithm/kmeans";


export default function ImageUpload() {

    const [image, setImage] = useState(null);
    const [compressedImage, setcompressedImage] = useState(null);
    const [uploadedSize, setUploadedSize] = useState(null);
    const [compressedSize, setCompressedSize] = useState(null);
    const [downloadLink, setDownloadLink] = useState(null);
    const [loading, setloading] = useState(null);
    const handleImageUpload = (e) => {
        
        setloading(1);
        const file = e.target.files[0];
        if (file) {
            
            setcompressedImage(null);
            setloading(1);
            const uploadedSizeBytes = file.size;

            // Calculate the size in kilobytes (KB)
            const uploadedSizeKB = uploadedSizeBytes / 1024;

            setUploadedSize(uploadedSizeKB.toFixed(2) + " KB");
            const img = new Image();
            img.onload = async () => {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, img.width, img.height);

                // Extract the pixel data
                const pixelData = ctx.getImageData(0, 0, img.width, img.height).data;

                const numRows = img.height;
                const numCols = img.width;

                const rgbMatrix = [];

                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {
                        const offset = (i * numCols + j) * 4; // Each pixel is represented by 4 values (RGBA)
                        const r = pixelData[offset] / 255; // Normalize Red
                        const g = pixelData[offset + 1] / 255; // Normalize Green
                        const b = pixelData[offset + 2] / 255; // Normalize Blue
                        rgbMatrix.push([r, g, b]);
                    }
                }

                const result = await performKMeansClustering(rgbMatrix, 10);


                const clusterAssignments = result.clusters;
                const clusterCenters = result.centroids;

                //make output canvas
                const compressedCanvas = document.createElement("canvas");
                const compressedCtx = compressedCanvas.getContext("2d");
                compressedCanvas.width = img.width;
                compressedCanvas.height = img.height;

                //Draw compressed image in new canvas
                for (let i = 0; i < numRows; i++) {
                    for (let j = 0; j < numCols; j++) {
                        const clusterindex = clusterAssignments[i * numCols + j];
                        const [r, g, b] = clusterCenters[clusterindex];
                        const imageData = compressedCtx.createImageData(1, 1);
                        imageData.data[0] = r * 255;
                        imageData.data[1] = g * 255;
                        imageData.data[2] = b * 255;
                        imageData.data[3] = 255;
                        compressedCtx.putImageData(imageData, j, i);
                    }
                }
                //convert canvas to a dataURL
                const compressedDataUrl = compressedCanvas.toDataURL("image/jpeg");
                setloading(null);
                setcompressedImage(compressedDataUrl);

                // Create a Blob from the compressed data
                const blob = await (await fetch(compressedDataUrl)).blob();

                // Create a download link
                const url = URL.createObjectURL(blob);
                setDownloadLink(url);

                const compressedSizeBytes = blob.size;

                // Calculate the size in kilobytes (KB)
                const compressedSizeKB = compressedSizeBytes / 1024;

                setCompressedSize(compressedSizeKB.toFixed(2) + " KB");
            }

            const render = new FileReader();
            render.onload = (e) => {
                // console.log(e.target.result)
                const dataURL = e.target.result;
                setImage(dataURL);
                setloading(null);
                img.src = dataURL;
            };
            setloading(1);
            render.readAsDataURL(file);//when reading is complete onLoad is triggered

        }
    }

    return (
        <>
            <div className="mb-3">{/*bootstrap*/}
                <label htmlFor="formFile" className="form-label">Default file input example</label>
                <input className="form-control" id="formFile" accept="image/*" type="file" name="file" onChange={handleImageUpload} />
            </div>
            <div className="images">
                {image && <img src={image} alt="Uploaded!!" style={{ width: "30vw", borderRadius: "10px" }} className="border border-primary" />}
                {image && <img src="./arrow.png" style={{height: "10vw",transform: "rotate(180deg)"}} alt="Arrow" />}
                {loading&&<img src="./loading.gif" style={{height: "10vw",transform: "rotate(180deg)"}} alt="Arrow" />}
                {compressedImage && <img src={compressedImage} alt="Compressed!!" style={{ width: "30vw", borderRadius: "10px" }} className="border border-primary" />}
            </div>
            {uploadedSize && <p>Uploaded Image Size: {uploadedSize}</p>}
            {compressedSize && <p>Compressed Image Size: {compressedSize}</p>}
            {downloadLink && <a href={downloadLink} download="compressed_image.jpg"><button>Download Compressed Image</button></a>}
        </>
    )
}