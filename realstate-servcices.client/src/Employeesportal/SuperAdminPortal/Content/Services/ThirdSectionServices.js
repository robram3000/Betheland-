// ThirdSectionServices.js - COMPLETE FIXED VERSION
import api from '../../../../Authpage/Services/Api';

class ThirdSectionServices {
    // Constants for limits
    static MAX_PROCESS_STEPS = 5;
    static MAX_FEATURE_ITEMS = 5;

    // Get third section data - PROPERLY FIXED VERSION
    async getThirdSection() {
        try {
            console.log('🔍 ThirdSectionServices: Making GET request to /ThirdSection');

            const response = await api.get('/ThirdSection');
            console.log('✅ ThirdSectionServices: Full API Response:', response);

            // FIX: Properly handle the response structure
            let responseData = response;

            // If the response itself has the data properties directly (not nested in response.data)
            if (response && typeof response === 'object') {
                // Check if the response has the expected properties directly
                if (response.id !== undefined || response.title !== undefined || response.processSteps !== undefined) {
                    console.log('📊 ThirdSectionServices: Using response directly as data');
                    responseData = response;
                }
                // If data is nested in response.data
                else if (response.data && typeof response.data === 'object') {
                    console.log('📊 ThirdSectionServices: Using response.data as data');
                    responseData = response.data;
                }
                // If data is nested in other common properties
                else if (response.result) {
                    console.log('📊 ThirdSectionServices: Using response.result as data');
                    responseData = response.result;
                }
                else if (response.value) {
                    console.log('📊 ThirdSectionServices: Using response.value as data');
                    responseData = response.value;
                }
            }

            // If we still don't have valid data, return default
            if (!responseData || (responseData.id === undefined && !responseData.title && !responseData.processSteps)) {
                console.warn('⚠️ ThirdSectionServices: No valid data found, returning default');
                return this.createDefaultThirdSection();
            }

            console.log('📊 ThirdSectionServices: Successfully extracted data:', {
                id: responseData.id,
                title: responseData.title,
                processStepsCount: responseData.processSteps?.length || 0,
                featureItemsCount: responseData.featureItems?.length || 0
            });

            return responseData;
        } catch (error) {
            console.error('❌ ThirdSectionServices: Error getting third section:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });

            // Return default structure on error
            console.warn('🔄 ThirdSectionServices: Returning default structure due to error');
            return this.createDefaultThirdSection();
        }
    }

    async updateThirdSection(thirdSectionData) {
        try {
            console.log('🔍 ThirdSectionServices: Making PUT request to /ThirdSection with data:', {
                id: thirdSectionData.id,
                title: thirdSectionData.title,
                processStepsCount: thirdSectionData.processSteps?.length || 0,
                featureItemsCount: thirdSectionData.featureItems?.length || 0
            });

            // Validate limits before sending
            const validation = this.validateThirdSection(thirdSectionData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
            }

            const response = await api.put('/ThirdSection', thirdSectionData);

            console.log('✅ ThirdSectionServices: Update API Full Response:', response);

            // FIX: Handle response data extraction the same way as GET
            let responseData = response;

            if (response && typeof response === 'object') {
                if (response.id !== undefined || response.title !== undefined) {
                    responseData = response;
                }
                else if (response.data && typeof response.data === 'object') {
                    responseData = response.data;
                }
                else if (response.result) {
                    responseData = response.result;
                }
                else if (response.value) {
                    responseData = response.value;
                }
            }

            if (!responseData) {
                console.warn('⚠️ ThirdSectionServices: Update API returned no data');
                return thirdSectionData;
            }

            console.log('📊 ThirdSectionServices: Update successful -', {
                id: responseData.id,
                title: responseData.title
            });

            return responseData;
        } catch (error) {
            console.error('❌ ThirdSectionServices: Error updating third section:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(`Failed to update third section: ${error.message}`);
        }
    }

    createDefaultThirdSection() {
        const defaultData = {
            id: 0,
            title: '',
            subtitle: '',
            description: '',
            processSteps: [],
            featureItems: []
        };
        console.log('🔄 ThirdSectionServices: Created default third section structure');
        return defaultData;
    }

    createDefaultProcessStep() {
        return {
            id: 0,
            stepNumber: 0,
            title: '',
            description: '',
            icon: ''
        };
    }

    createDefaultFeatureItem() {
        return {
            id: 0,
            title: '',
            description: '',
            icon: ''
        };
    }

    validateThirdSection(data) {
        console.log('🔍 ThirdSectionServices: Validating third section data');

        const errors = {};

        if (!data.title || data.title.trim() === '') {
            errors.title = 'Title is required';
        }

        if (!data.subtitle || data.subtitle.trim() === '') {
            errors.subtitle = 'Subtitle is required';
        }

        if (!data.description || data.description.trim() === '') {
            errors.description = 'Description is required';
        }

        // Validate process steps limits
        if (data.processSteps && data.processSteps.length > ThirdSectionServices.MAX_PROCESS_STEPS) {
            errors.processSteps = `Cannot have more than ${ThirdSectionServices.MAX_PROCESS_STEPS} process steps`;
        }

        // Validate feature items limits
        if (data.featureItems && data.featureItems.length > ThirdSectionServices.MAX_FEATURE_ITEMS) {
            errors.featureItems = `Cannot have more than ${ThirdSectionServices.MAX_FEATURE_ITEMS} feature items`;
        }

        // Validate process steps content
        if (data.processSteps && data.processSteps.length > 0) {
            data.processSteps.forEach((step, index) => {
                if (!step.title || step.title.trim() === '') {
                    errors[`processStep_${index}_title`] = `Process step ${index + 1} title is required`;
                }
                if (!step.description || step.description.trim() === '') {
                    errors[`processStep_${index}_description`] = `Process step ${index + 1} description is required`;
                }
                if (step.stepNumber <= 0) {
                    errors[`processStep_${index}_stepNumber`] = `Process step ${index + 1} step number must be greater than 0`;
                }
            });
        }

        // Validate feature items content
        if (data.featureItems && data.featureItems.length > 0) {
            data.featureItems.forEach((item, index) => {
                if (!item.title || item.title.trim() === '') {
                    errors[`featureItem_${index}_title`] = `Feature item ${index + 1} title is required`;
                }
                if (!item.description || item.description.trim() === '') {
                    errors[`featureItem_${index}_description`] = `Feature item ${index + 1} description is required`;
                }
            });
        }

        const isValid = Object.keys(errors).length === 0;
        console.log(`📊 ThirdSectionServices: Validation ${isValid ? 'passed' : 'failed'} - ${Object.keys(errors).length} errors`);

        return {
            isValid,
            errors
        };
    }

    // Check if can add more items
    canAddProcessStep(currentSteps) {
        return (currentSteps?.length || 0) < ThirdSectionServices.MAX_PROCESS_STEPS;
    }

    canAddFeatureItem(currentItems) {
        return (currentItems?.length || 0) < ThirdSectionServices.MAX_FEATURE_ITEMS;
    }

    // Get remaining slots
    getRemainingProcessSlots(currentSteps) {
        return Math.max(0, ThirdSectionServices.MAX_PROCESS_STEPS - (currentSteps?.length || 0));
    }

    getRemainingFeatureSlots(currentItems) {
        return Math.max(0, ThirdSectionServices.MAX_FEATURE_ITEMS - (currentItems?.length || 0));
    }

    sortProcessSteps(processSteps) {
        return [...processSteps].sort((a, b) => a.stepNumber - b.stepNumber);
    }

    getNextStepNumber(processSteps) {
        if (!processSteps || processSteps.length === 0) return 1;
        const maxStepNumber = Math.max(...processSteps.map(step => step.stepNumber));
        return maxStepNumber + 1;
    }
}

export default new ThirdSectionServices();