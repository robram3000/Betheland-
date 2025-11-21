// utils/imageUtils.js
export const processImageUrl = (url) => {
    if (!url || url.trim() === '') return '/default-property.jpg';

    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // Determine base URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDevelopment ? 'https://localhost:7080' : 'http://betheland.runasp.net';

    // Handle absolute paths starting with /uploads/
    if (url.startsWith('/uploads/')) {
        return `${baseUrl}${url}`;
    }

    // Handle relative paths starting with uploads/
    if (url.startsWith('uploads/')) {
        return `${baseUrl}/${url}`;
    }

    // Handle any path that contains a file extension (image file)
    if (url.includes('.') && (url.includes('/') || url.startsWith('/'))) {
        // If it already starts with /, use as is, otherwise add /uploads/properties/
        if (url.startsWith('/')) {
            return `${baseUrl}${url}`;
        } else {
            return `${baseUrl}/uploads/properties/${url}`;
        }
    }

    // Final fallback for any unrecognized format that looks like a filename
    if (url.includes('.')) {
        return `${baseUrl}/uploads/properties/${url}`;
    }

    return '/default-property.jpg';
};

// Enhanced version with better debugging
export const processImageUrlWithDebug = (url) => {
    console.log('🖼️ Processing image URL:', url);

    if (!url || url.trim() === '') {
        console.log('🖼️ URL is empty, using default');
        return '/default-property.jpg';
    }

    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        console.log('🖼️ Already full URL:', url);
        return url;
    }

    // Determine base URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDevelopment ? 'https://localhost:7080' : 'http://betheland.runasp.net';
    console.log('🖼️ Using base URL:', baseUrl);

    // Handle absolute paths starting with /uploads/
    if (url.startsWith('/uploads/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('🖼️ Absolute uploads path ->', fullUrl);
        return fullUrl;
    }

    // Handle relative paths starting with uploads/
    if (url.startsWith('uploads/')) {
        const fullUrl = `${baseUrl}/${url}`;
        console.log('🖼️ Relative uploads path ->', fullUrl);
        return fullUrl;
    }

    // Handle paths that look like they're in the properties directory
    if (url.includes('/') || url.includes('.')) {
        // If it starts with /, it's an absolute path
        if (url.startsWith('/')) {
            const fullUrl = `${baseUrl}${url}`;
            console.log('🖼️ Absolute path ->', fullUrl);
            return fullUrl;
        }
        // If it contains properties/ or looks like a property image
        else if (url.includes('properties/') || url.match(/[a-f0-9-]+\.(png|jpg|jpeg|gif|webp)/i)) {
            const fullUrl = `${baseUrl}/uploads/properties/${url}`;
            console.log('🖼️ Property image path ->', fullUrl);
            return fullUrl;
        }
    }

    // Final attempt - assume it's a property image
    if (url.includes('.')) {
        const fullUrl = `${baseUrl}/uploads/properties/${url}`;
        console.log('🖼️ Fallback property path ->', fullUrl);
        return fullUrl;
    }

    console.log('🖼️ No match, using default image');
    return '/default-property.jpg';
};

// Alternative version using environment variables for more flexibility
export const processImageUrlWithEnv = (url) => {
    if (!url) return '/default-property.jpg';

    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // Use environment variable if available, otherwise detect automatically
    const baseUrl = process.env.REACT_APP_API_BASE_URL ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'https://localhost:7080'
            : 'http://betheland.runasp.net');

    // Handle relative paths
    if (url.startsWith('/uploads/')) {
        return `${baseUrl}${url}`;
    }

    // Handle paths without leading slash
    if (url.startsWith('uploads/')) {
        return `${baseUrl}/${url}`;
    }

    // Handle specific property image paths
    if (url.includes('.') && !url.startsWith('/')) {
        return `${baseUrl}/uploads/properties/${url}`;
    }

    return '/default-property.jpg';
};

// Helper function to get property image with fallback
export const getPropertyImage = (property) => {
    return processImageUrl(
        property.mainImage ||
        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
        (property.imageUrls && property.imageUrls[0]) ||
        '/default-property.jpg'
    );
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