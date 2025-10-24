export const processImageUrl = (url, type = 'property') => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return type === 'property' ? '/default-property.jpg' : '/default-avatar.jpg';
    }

    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://betheland.runasp.net';

    // Handle the specific case where URL starts with /uploads/
    if (url.startsWith('/uploads/')) {
        return `${baseUrl}${url}`;
    }

    // Handle case where URL is just a filename (like "62963fff-817b-4f9d-acf1-59fe0178a0bc.png")
    if (url.includes('.') && !url.startsWith('/')) {
        const uploadsFolder = type === 'agent' ? 'agents' : 'properties';
        return `${baseUrl}/uploads/${uploadsFolder}/${url}`;
    }

    // Handle case where URL starts with / but not /uploads
    if (url.startsWith('/') && !url.startsWith('/uploads')) {
        return `${baseUrl}${url}`;
    }

    // For any other format that starts with uploads/ (without leading slash)
    if (url.startsWith('uploads/')) {
        return `${baseUrl}/${url}`;
    }

    console.warn(`Unable to process image URL: ${url}, type: ${type}`);
    return type === 'property' ? '/default-property.jpg' : '/default-avatar.jpg';
};


const getPropertyImages = () => {
    const images = [];

    // Add main image if available (PROCESSED)
    if (property.mainImage) {
        images.push(processImageUrl(property.mainImage, 'property'));
    }

    // Add property images array if available (PROCESSED)
    if (property.propertyImages && Array.isArray(property.propertyImages)) {
        property.propertyImages.forEach(img => {
            if (img.imageUrl) images.push(processImageUrl(img.imageUrl, 'property'));
        });
    }

    // Add imageUrls array if available (PROCESSED)
    if (property.imageUrls && Array.isArray(property.imageUrls)) {
        property.imageUrls.forEach(url => {
            if (url) images.push(processImageUrl(url, 'property'));
        });
    }

    // Remove duplicates and return
    const uniqueImages = [...new Set(images.filter(img => img && img.trim() !== ''))];
    return uniqueImages.length > 0 ? uniqueImages : ['/default-property.jpg'];
};

// Debug helper function
export const debugImageUrl = (url, type = 'property') => {
    const result = processImageUrl(url, type);
    console.log(`Image URL Debug - Original: ${url}, Processed: ${result}, Type: ${type}`);
    return result;
};