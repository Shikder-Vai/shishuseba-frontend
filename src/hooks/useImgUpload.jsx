import { useState } from 'react';
import axios from 'axios';
import { imgbbKey } from './useImgbb';

const useImgUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImg = async (imageFile) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    const imgbbAxios = axios.create({
      withCredentials: false // Explicitly set withCredentials to false
    });

    try {
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
