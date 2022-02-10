const jsonToSchema = (json)=>{
    if (typeof json === 'string') {
        return {
            type: 'string'
        };
    }
    if (typeof json === 'number') {
        return {
            type: 'float64'
        };
    }
    if (typeof json === 'boolean') {
        return {
            type: 'boolean'
        };
    }
    if (json === null) {
        return {
            type: 'null'
        };
    }
    if (Array.isArray(json)) {
        const itemSchemas = [];
        for (const val of json){
            itemSchemas.push(jsonToSchema(val));
        }
        return {
            type: 'tuple',
            itemSchemas
        };
    }
    const entries = Object.entries(json);
    let props = Object.create(null);
    for (const [key, val] of entries){
        props[key] = jsonToSchema(val);
    }
    return {
        type: 'object',
        props
    };
};
const jsonToJevko = (json)=>{
    if ([
        'string',
        'boolean',
        'number'
    ].includes(typeof json)) return {
        subjevkos: [],
        suffix: json.toString()
    };
    if (json === null) return {
        subjevkos: [],
        suffix: ''
    };
    if (Array.isArray(json)) {
        return {
            subjevkos: json.map((v)=>({
                    prefix: '',
                    jevko: jsonToJevko(v)
                })
            ),
            suffix: ''
        };
    }
    const entries = Object.entries(json);
    return {
        suffix: '',
        subjevkos: entries.map(([k, v])=>({
                prefix: k,
                jevko: jsonToJevko(v)
            })
        )
    };
};
export { jsonToSchema as jsonToSchema };
const interJevkoToSchema = (jevko)=>{
    const { subjevkos , suffix  } = jevko;
    const trimmed = suffix.trim();
    if (subjevkos.length === 0) {
        if ([
            'true',
            'false'
        ].includes(trimmed)) return {
            type: 'boolean'
        };
        if (trimmed === 'null') return {
            type: 'null'
        };
        if (trimmed === 'NaN') return {
            type: 'float64'
        };
        if (trimmed === '') return {
            type: 'string'
        };
        const num = Number(trimmed);
        if (Number.isNaN(num)) return {
            type: 'string'
        };
        return {
            type: 'float64'
        };
    }
    if (trimmed !== '') throw Error('suffix must be blank');
    const { prefix  } = subjevkos[0];
    if (prefix.trim() === '') {
        const itemSchemas = [];
        for (const { prefix , jevko  } of subjevkos){
            if (prefix.trim() !== '') throw Error('bad tuple/array');
            itemSchemas.push(interJevkoToSchema(jevko));
        }
        return {
            type: 'tuple',
            itemSchemas
        };
    }
    const props = Object.create(null);
    for (const { prefix: prefix1 , jevko: jevko1  } of subjevkos){
        const key = prefix1.trim();
        props[key] = interJevkoToSchema(jevko1);
    }
    return {
        type: 'object',
        props
    };
};
export { interJevkoToSchema as interJevkoToSchema };
