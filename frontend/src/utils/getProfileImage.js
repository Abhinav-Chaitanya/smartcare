// frontend/src/utils/getProfileImage.js
// ============================================================
// Use this wherever you display a user profile image.
// Import it and call getProfileImage(userData?.image)
// It returns either the real Cloudinary URL or the local default.
// ============================================================

import { assets } from '../assets/assets'

const getProfileImage = (imageUrl) => {
    // If no image, empty string, or still the old base64 default → use local asset
    if (!imageUrl || imageUrl === '' || imageUrl.startsWith('data:image')) {
        return assets.profile_pic1
    }
    return imageUrl
}

export default getProfileImage