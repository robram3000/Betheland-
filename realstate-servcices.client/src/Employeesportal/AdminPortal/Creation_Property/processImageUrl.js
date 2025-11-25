// utils/imageUtils.js - CORRECTED VERSION (7080 only)
export const processImageUrl = (url) => {
    console.log('🖼️ Processing image URL:', url);

    if (!url || typeof url !== 'string' || url.trim() === '') {
        console.log('🖼️ URL is empty, using default');
        return '/default-property.jpg';
    }

    const trimmedUrl = url.trim();

    // If it's already a full URL, return as is
    if (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('//') || trimmedUrl.startsWith('blob:') || trimmedUrl.startsWith('data:')) {
        console.log('🖼️ Already full URL:', trimmedUrl);
        return trimmedUrl;
    }

    // Use port 7080 consistently for all images
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDevelopment ? 'https://localhost:7080' : 'http://betheland.runasp.net';
    console.log('🖼️ Using base URL:', baseUrl);

    // Handle absolute paths starting with /uploads/
    if (trimmedUrl.startsWith('/uploads/')) {
        const fullUrl = `${baseUrl}${trimmedUrl}`;
        console.log('🖼️ Absolute uploads path ->', fullUrl);
        return fullUrl;
    }

    // Handle relative paths starting with uploads/
    if (trimmedUrl.startsWith('uploads/')) {
        const fullUrl = `${baseUrl}/${trimmedUrl}`;
        console.log('🖼️ Relative uploads path ->', fullUrl);
        return fullUrl;
    }

    // Handle paths that look like they're in the properties directory
    if (trimmedUrl.includes('/') || trimmedUrl.includes('.')) {
        // If it starts with /, it's an absolute path
        if (trimmedUrl.startsWith('/')) {
            const fullUrl = `${baseUrl}${trimmedUrl}`;
            console.log('🖼️ Absolute path ->', fullUrl);
            return fullUrl;
        }
        // If it contains properties/ or looks like a property image
        else if (trimmedUrl.includes('properties/') || trimmedUrl.match(/[a-f0-9-]+\.(png|jpg|jpeg|gif|webp)/i)) {
            const fullUrl = `${baseUrl}/uploads/properties/${trimmedUrl}`;
            console.log('🖼️ Property image path ->', fullUrl);
            return fullUrl;
        }
    }

    // Final attempt - assume it's a property image
    if (trimmedUrl.includes('.')) {
        const fullUrl = `${baseUrl}/uploads/properties/${trimmedUrl}`;
        console.log('🖼️ Fallback property path ->', fullUrl);
        return fullUrl;
    }

    console.log('🖼️ No match, using default image');
    return '/default-property.jpg';
};

// Helper function to get property image with fallback
export const getPropertyImage = (property) => {
    if (!property) return '/default-property.jpg';

    return processImageUrl(
        property.mainImage ||
        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
        (property.imageUrls && property.imageUrls[0]) ||
        '/default-property.jpg'
    );
};

// Helper function to get all property images
export const getAllPropertyImages = (property) => {
    if (!property) return ['/default-property.jpg'];

    const images = new Set();

    // Add main image
    if (property.mainImage) {
        images.add(processImageUrl(property.mainImage));
    }

    // Add property images array
    if (property.propertyImages && Array.isArray(property.propertyImages)) {
        property.propertyImages.forEach(img => {
            if (img.imageUrl) {
                images.add(processImageUrl(img.imageUrl));
            }
        });
    }

    // Add imageUrls array
    if (property.imageUrls && Array.isArray(property.imageUrls)) {
        property.imageUrls.forEach(url => {
            if (url) {
                images.add(processImageUrl(url));
            }
        });
    }

    // Add other possible image fields
    if (property.image) images.add(processImageUrl(property.image));
    if (property.thumbnail) images.add(processImageUrl(property.thumbnail));
    if (property.coverImage) images.add(processImageUrl(property.coverImage));

    // Convert Set to Array and ensure we have at least default image
    const imageArray = Array.from(images);
    return imageArray.length > 0 ? imageArray : ['/default-property.jpg'];
};

// Helper function to get all media for a property
export const getAllMedia = (property) => {
    const media = [];

    // Add main image
    if (property.mainImage) {
        media.push({
            type: 'image',
            url: processImageUrl(property.mainImage),
            title: 'Main Image'
        });
    }

    // Add property images
    if (property.propertyImages && property.propertyImages.length > 0) {
        property.propertyImages.forEach((img, index) => {
            if (img.imageUrl) {
                media.push({
                    type: 'image',
                    url: processImageUrl(img.imageUrl),
                    title: `Image ${index + 1}`
                });
            }
        });
    }

    // Add image URLs
    if (property.imageUrls && property.imageUrls.length > 0) {
        property.imageUrls.forEach((url, index) => {
            if (url) {
                media.push({
                    type: 'image',
                    url: processImageUrl(url),
                    title: `Image ${index + 1}`
                });
            }
        });
    }

    // Add videos
    if (property.videoUrls && property.videoUrls.length > 0) {
        property.videoUrls.forEach((url, index) => {
            if (url) {
                media.push({
                    type: 'video',
                    url: processImageUrl(url),
                    title: `Video ${index + 1}`
                });
            }
        });
    }

    // Add property video
    if (property.propertyVideo) {
        media.push({
            type: 'video',
            url: processImageUrl(property.propertyVideo),
            title: 'Property Video'
        });
    }

    // Add property videos array
    if (property.propertyVideos && property.propertyVideos.length > 0) {
        property.propertyVideos.forEach((video, index) => {
            if (video.videoUrl) {
                media.push({
                    type: 'video',
                    url: processImageUrl(video.videoUrl),
                    title: video.videoName || `Video ${index + 1}`
                });
            }
        });
    }

    return media;
};

// Helper to get media count for badges
export const getMediaCounts = (property) => {
    const allMedia = getAllMedia(property);
    const imageCount = allMedia.filter(m => m.type === 'image').length;
    const videoCount = allMedia.filter(m => m.type === 'video').length;

    return { imageCount, videoCount, total: allMedia.length };
};