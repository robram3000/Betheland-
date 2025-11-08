class ThirdSectionMapper {
    // Map API response to frontend format
    mapFromApi(apiData) {
        if (!apiData) {
            return this.getEmptyThirdSection();
        }

        return {
            id: apiData.id || 0,
            title: apiData.title || '',
            subtitle: apiData.subtitle || '',
            description: apiData.description || '',
            processSteps: (apiData.processSteps || []).map(step => this.mapProcessStepFromApi(step)),
            featureItems: (apiData.featureItems || []).map(item => this.mapFeatureItemFromApi(item))
        };
    }

    // Map frontend data to API format
    mapToApi(frontendData) {
        return {
            id: frontendData.id || 0,
            title: frontendData.title || '',
            subtitle: frontendData.subtitle || '',
            description: frontendData.description || '',
            processSteps: (frontendData.processSteps || []).map(step => this.mapProcessStepToApi(step)),
            featureItems: (frontendData.featureItems || []).map(item => this.mapFeatureItemToApi(item))
        };
    }

    // Map process step from API
    mapProcessStepFromApi(apiStep) {
        return {
            id: apiStep.id || 0,
            stepNumber: apiStep.stepNumber || 0,
            title: apiStep.title || '',
            description: apiStep.description || '',
            icon: apiStep.icon || '',
            isNew: apiStep.id === 0 // Flag for new items
        };
    }

    // Map process step to API
    mapProcessStepToApi(frontendStep) {
        return {
            id: frontendStep.id || 0,
            stepNumber: frontendStep.stepNumber || 0,
            title: frontendStep.title || '',
            description: frontendStep.description || '',
            icon: frontendStep.icon || ''
        };
    }

    // Map feature item from API
    mapFeatureItemFromApi(apiItem) {
        return {
            id: apiItem.id || 0,
            title: apiItem.title || '',
            description: apiItem.description || '',
            icon: apiItem.icon || '',
            isNew: apiItem.id === 0 // Flag for new items
        };
    }

    // Map feature item to API
    mapFeatureItemToApi(frontendItem) {
        return {
            id: frontendItem.id || 0,
            title: frontendItem.title || '',
            description: frontendItem.description || '',
            icon: frontendItem.icon || ''
        };
    }

    // Get empty third section structure
    getEmptyThirdSection() {
        return {
            id: 0,
            title: '',
            subtitle: '',
            description: '',
            processSteps: [],
            featureItems: []
        };
    }

    // Get empty process step
    getEmptyProcessStep(stepNumber = 0) {
        return {
            id: 0,
            stepNumber: stepNumber,
            title: '',
            description: '',
            icon: '',
            isNew: true
        };
    }

    // Get empty feature item
    getEmptyFeatureItem() {
        return {
            id: 0,
            title: '',
            description: '',
            icon: '',
            isNew: true
        };
    }

    // Prepare data for form (add temporary IDs for new items)
    prepareForForm(data) {
        const preparedData = { ...data };

        // Add temporary IDs for new process steps
        preparedData.processSteps = (preparedData.processSteps || []).map((step, index) => ({
            ...step,
            tempId: step.id === 0 ? `temp_step_${index}` : undefined
        }));

        // Add temporary IDs for new feature items
        preparedData.featureItems = (preparedData.featureItems || []).map((item, index) => ({
            ...item,
            tempId: item.id === 0 ? `temp_item_${index}` : undefined
        }));

        return preparedData;
    }

    // Clean data before submission (remove temporary IDs)
    cleanBeforeSubmit(data) {
        const cleanedData = { ...data };

        cleanedData.processSteps = (cleanedData.processSteps || []).map(step => {
            const { tempId, ...cleanStep } = step;
            return cleanStep;
        });

        cleanedData.featureItems = (cleanedData.featureItems || []).map(item => {
            const { tempId, ...cleanItem } = item;
            return cleanItem;
        });

        return cleanedData;
    }

    // Merge existing data with updates
    mergeData(existingData, updates) {
        return {
            ...existingData,
            ...updates,
            processSteps: this.mergeArrays(existingData.processSteps, updates.processSteps, 'id'),
            featureItems: this.mergeArrays(existingData.featureItems, updates.featureItems, 'id')
        };
    }

    // Helper method to merge arrays while preserving order
    mergeArrays(existingArray, updateArray, key) {
        if (!updateArray) return existingArray || [];
        if (!existingArray) return updateArray;

        const merged = [...existingArray];

        updateArray.forEach(updateItem => {
            const existingIndex = merged.findIndex(item => item[key] === updateItem[key]);
            if (existingIndex >= 0) {
                merged[existingIndex] = { ...merged[existingIndex], ...updateItem };
            } else {
                merged.push(updateItem);
            }
        });

        return merged;
    }
}

export default new ThirdSectionMapper();