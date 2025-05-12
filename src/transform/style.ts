export type WrittenStyle = {
    capitalization: 'lowercase' | 'capitalized' | 'uppercase';
    quoted: boolean;
};

export type CodeStyle = {
    tab: string;
    binOpStyle: 'symbolic' | WrittenStyle;
    cmpOpStyle: 'symbolic' | WrittenStyle;
    statStyle: 'placeholder' | 'shorthand';
    placeholderStyle: 'normal' | 'quoted';
    lineLength: number;
    explicitConditionalAnd: boolean;
};

export const DEFAULT_CODE_STYLE: CodeStyle = {
    tab: '    ',
    binOpStyle: 'symbolic',
    cmpOpStyle: 'symbolic',
    statStyle: 'shorthand',
    placeholderStyle: 'normal',
    lineLength: 80,
    explicitConditionalAnd: false,
};
