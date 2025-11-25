// ThirdSectionMapper.js - COMPLETE FIXED VERSION
class ThirdSectionMapper {
    // Constants for limits
    static MAX_PROCESS_STEPS = 5;
    static MAX_FEATURE_ITEMS = 5;

    // Map API response to frontend format
    mapFromApi(apiData) {
        console.log('🔍 ThirdSectionMapper: Mapping from API data:', apiData);

        // Handle null/undefined API response
        if (!apiData || apiData === undefined) {
            console.log('❌ ThirdSectionMapper: No API data received, returning empty structure');
            return this.getEmptyThirdSection();
        }

        // Check if it's an empty DTO (all fields empty or default)
        const isEmptyDto =
            (apiData.id === 0 || apiData.id === undefined) &&
            (!apiData.title || apiData.title === '') &&
            (!apiData.subtitle || apiData.subtitle === '') &&
            (!apiData.description || apiData.description === '') &&
            (!apiData.processSteps || apiData.processSteps.length === 0) &&
            (!apiData.featureItems || apiData.featureItems.length === 0);

        if (isEmptyDto) {
            console.log('ℹ️ ThirdSectionMapper: Empty DTO received, returning empty structure');
            return this.getEmptyThirdSection();
        }

        console.log('✅ ThirdSectionMapper: Processing valid data -', {
            id: apiData.id,
            title: apiData.title,
            hasProcessSteps: !!apiData.processSteps,
            hasFeatureItems: !!apiData.featureItems
        });

        // Apply limits during mapping
        const mappedData = {
            id: apiData.id || 0,
            title: apiData.title || '',
            subtitle: apiData.subtitle || '',
            description: apiData.description || '',
            processSteps: (apiData.processSteps || []).slice(0, ThirdSectionMapper.MAX_PROCESS_STEPS).map(step => this.mapProcessStepFromApi(step)),
            featureItems: (apiData.featureItems || []).slice(0, ThirdSectionMapper.MAX_FEATURE_ITEMS).map(item => this.mapFeatureItemFromApi(item))
        };

        console.log('🎯 ThirdSectionMapper: Mapped data result:', mappedData);
        return mappedData;
    }

    mapToApi(frontendData) {
        console.log('🔍 ThirdSectionMapper: Mapping to API data:', frontendData);

        // Apply limits before sending to API
        const apiData = {
            id: frontendData.id || 0,
            title: frontendData.title || '',
            subtitle: frontendData.subtitle || '',
            description: frontendData.description || '',
            processSteps: (frontendData.processSteps || []).slice(0, ThirdSectionMapper.MAX_PROCESS_STEPS).map(step => this.mapProcessStepToApi(step)),
            featureItems: (frontendData.featureItems || []).slice(0, ThirdSectionMapper.MAX_FEATURE_ITEMS).map(item => this.mapFeatureItemToApi(item))
        };

        console.log('🎯 ThirdSectionMapper: API data result:', apiData);
        return apiData;
    }

    // Check if can add more process steps
    canAddProcessStep(currentSteps) {
        return (currentSteps?.length || 0) < ThirdSectionMapper.MAX_PROCESS_STEPS;
    }

    // Check if can add more feature items
    canAddFeatureItem(currentItems) {
        return (currentItems?.length || 0) < ThirdSectionMapper.MAX_FEATURE_ITEMS;
    }

    // Get remaining slots
    getRemainingProcessSlots(currentSteps) {
        return Math.max(0, ThirdSectionMapper.MAX_PROCESS_STEPS - (currentSteps?.length || 0));
    }

    getRemainingFeatureSlots(currentItems) {
        return Math.max(0, ThirdSectionMapper.MAX_FEATURE_ITEMS - (currentItems?.length || 0));
    }

    mapProcessStepFromApi(apiStep) {
        if (!apiStep) return this.getEmptyProcessStep();

        return {
            id: apiStep.id || 0,
            stepNumber: apiStep.stepNumber || 0,
            title: apiStep.title || '',
            description: apiStep.description || '',
            icon: apiStep.icon || '',
            isNew: apiStep.id === 0
        };
    }

    mapProcessStepToApi(frontendStep) {
        if (!frontendStep) return this.getEmptyProcessStep();

        return {
            id: frontendStep.id || 0,
            stepNumber: frontendStep.stepNumber || 0,
            title: frontendStep.title || '',
            description: frontendStep.description || '',
            icon: frontendStep.icon || ''
        };
    }

    mapFeatureItemFromApi(apiItem) {
        if (!apiItem) return this.getEmptyFeatureItem();

        return {
            id: apiItem.id || 0,
            title: apiItem.title || '',
            description: apiItem.description || '',
            icon: apiItem.icon || '',
            isNew: apiItem.id === 0
        };
    }

    mapFeatureItemToApi(frontendItem) {
        if (!frontendItem) return this.getEmptyFeatureItem();

        return {
            id: frontendItem.id || 0,
            title: frontendItem.title || '',
            description: frontendItem.description || '',
            icon: frontendItem.icon || ''
        };
    }

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

    getEmptyFeatureItem() {
        return {
            id: 0,
            title: '',
            description: '',
            icon: '',
            isNew: true
        };
    }

    generateUniqueKey(item, index, type = 'item') {
        if (item.id && item.id > 0) {
            return `${type}_${item.id}`;
        }
        if (item.tempId) {
            return item.tempId;
        }
        return `${type}_temp_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    prepareForForm(data) {
        const preparedData = { ...data };

        // Add temporary IDs for new process steps
        preparedData.processSteps = (preparedData.processSteps || []).map((step, index) => ({
            ...step,
            tempId: step.id === 0 ? `temp_step_${index}_${Date.now()}` : undefined
        }));

        // Add temporary IDs for new feature items
        preparedData.featureItems = (preparedData.featureItems || []).map((item, index) => ({
            ...item,
            tempId: item.id === 0 ? `temp_item_${index}_${Date.now()}` : undefined
        }));

        return preparedData;
    }

    cleanBeforeSubmit(data) {
        const cleanedData = { ...data };

        cleanedData.processSteps = (cleanedData.processSteps || []).map(step => {
            const { tempId, isNew, ...cleanStep } = step;
            return cleanStep;
        });

        cleanedData.featureItems = (cleanedData.featureItems || []).map(item => {
            const { tempId, isNew, ...cleanItem } = item;
            return cleanItem;
        });

        return cleanedData;
    }

    isEmpty(data) {
        return !data ||
            (!data.id &&
                !data.title &&
                !data.subtitle &&
                !data.description &&
                (!data.processSteps || data.processSteps.length === 0) &&
                (!data.featureItems || data.featureItems.length === 0));
    }
}

export default new ThirdSectionMapper();