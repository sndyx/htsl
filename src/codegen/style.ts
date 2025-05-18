export type WrittenStyle = {
    capitalization: 'lowercase' | 'capitalized' | 'uppercase';
    quoted: boolean;
};

export type CodeStyle = {
    tab: string;
    lineLength: number;
    binOpStyle: 'symbolic' | WrittenStyle;
    cmpOpStyle: 'symbolic' | WrittenStyle;
    placeholderStyle: 'shorthand' | 'normal' | 'quoted';
    useCommonShorthands: boolean;
};

export const DEFAULT_CODE_STYLE: CodeStyle = {
    tab: '    ',
    lineLength: 80,
    binOpStyle: 'symbolic',
    cmpOpStyle: 'symbolic',
    placeholderStyle: 'shorthand',
    useCommonShorthands: true,
};
