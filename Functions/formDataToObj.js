function formDataToObj(formData) {
    const result = {};

    for (let key in formData) {
        if (formData.hasOwnProperty(key)) {
            const value = formData[key];

            const nestedKeyMatch = key.match(/([^\[\]]+)\[([0-9]+)\]\[([^\[\]]+)\]/);
            const arrayKeyMatch = key.match(/([^\[\]]+)\[\]/);
            const objectKeyMatch = key.match(/([^\[\]]+)\[([^\[\]]+)\]/);

            if (nestedKeyMatch) {
                const mainKey = nestedKeyMatch[1];
                const index = parseInt(nestedKeyMatch[2]);
                const subKey = nestedKeyMatch[3];

                if (!result[mainKey]) {
                    result[mainKey] = [];
                }

                if (!result[mainKey][index]) {
                    result[mainKey][index] = {};
                }

                result[mainKey][index][subKey] = convertValue(value[0]);
            } else if (arrayKeyMatch) {
                const mainKey = arrayKeyMatch[1];
                result[mainKey] = value.map(convertValue);
            } else if (objectKeyMatch) {
                const mainKey = objectKeyMatch[1];
                const subKey = objectKeyMatch[2];

                if (!result[mainKey]) {
                    result[mainKey] = {};
                }

                result[mainKey][subKey] = convertValue(value[0]);
            } else {
                result[key] = convertValue(value[0]);
            }
        }
    }

    return result;
}

function convertValue(value) {
    if (value === 'true' || value === 'false') {
        return value === 'true';
    }
    if (!isNaN(value)) {
        return Number(value);
    }
    return value;
}

module.exports.formDataToObj = formDataToObj;
