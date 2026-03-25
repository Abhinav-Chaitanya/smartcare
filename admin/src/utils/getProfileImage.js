// admin/src/utils/getProfileImage.js
// Use this wherever you display a patient/user profile image.
// Call: getProfileImage(userData?.image)

import { assets } from '../assets/assets'

const getProfileImage = (imageUrl) => {
    if (!imageUrl || imageUrl === '' || imageUrl.startsWith('data:image')) {
        return assets.profile_pic1
    }
    return imageUrl
}

export default getProfileImage