import { useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { imgbbKey } from './useImgbb';

const useImgUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImg = async (imageFile) => {
    setIsUploading(true);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

      const compressedFile = await imageCompression(imageFile, options);
      console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`);

      const formData = new FormData();
      formData.append('image', compressedFile);

      const imgbbAxios = axios.create({
        withCredentials: false // Explicitly set withCredentials to false
      });

      const res = await imgbbAxios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsUploading(false);
      return res.data.data.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      setIsUploading(false);
      throw error;
    }
  };

  return { isUploading, uploadImg };
};

export default useImgUpload;
