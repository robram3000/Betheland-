// utils/imageUtils.js
export const processImageUrl = (url) => {
    if (!url) return '/default-property.jpg';

    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // Determine base URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDevelopment ? 'https://localhost:7080' : 'http://betheland.runasp.net';

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

// Add this to your processImageUrl.js file
export const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return '/default-video-thumb.jpg';

    // If it's a video file, return default thumbnail
    if (videoUrl.startsWith('blob:') || videoUrl.startsWith('data:')) {
        return '/default-video-thumb.jpg';
    }

    // For existing videos, try to get thumbnail
    const processedUrl = processImageUrl(videoUrl);

    // You might want to implement actual video thumbnail extraction here
    // For now, return default thumbnail for videos
    return '/default-video-thumb.jpg';
};

export const isVideoFile = (file) => {
    return file.type?.startsWith('video/') ||
        file.name?.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i);
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