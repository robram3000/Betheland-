import api from '../../../../Authpage/Services/Api';

class ThirdSectionServices {
    // Get third section data
    async getThirdSection() {
        try {
            const response = await api.get('/ThirdSection');
            return response.data;
        } catch (error) {
            console.error('Error getting third section:', error);
            throw new Error(`Failed to fetch third section: ${error.message}`);
        }
    }

    // Update third section data
    async updateThirdSection(thirdSectionData) {
        try {
            const response = await api.put('/ThirdSection', thirdSectionData);
            return response.data;
        } catch (error) {
            console.error('Error updating third section:', error);
            throw new Error(`Failed to update third section: ${error.message}`);
        }
    }

    // Create default third section structure
    createDefaultThirdSection() {
        return {
            id: 0,
            title: '',
            subtitle: '',
            description: '',
            processSteps: [],
            featureItems: []
        };
    }

    // Create default process step
    createDefaultProcessStep() {
        return {
            id: 0,
            stepNumber: 0,
            title: '',
            description: '',
            icon: ''
        };
    }

    // Create default feature item
    createDefaultFeatureItem() {
        return {
            id: 0,
            title: '',
            description: '',
            icon: ''
        };
    }

    // Validate third section data before submission
    validateThirdSection(data) {
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

        // Validate process steps
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

        // Validate feature items
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

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Sort process steps by step number
    sortProcessSteps(processSteps) {
        return [...processSteps].sort((a, b) => a.stepNumber - b.stepNumber);
    }

    // Generate next step number
    getNextStepNumber(processSteps) {
        if (!processSteps || processSteps.length === 0) return 1;
        const maxStepNumber = Math.max(...processSteps.map(step => step.stepNumber));
        return maxStepNumber + 1;
    }
}

export default new ThirdSectionServices();