import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (buffer) => {
  console.log("Upload function called");
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "mano_saathi_users" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};
