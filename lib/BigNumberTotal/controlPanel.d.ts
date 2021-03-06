declare const _default: {
    controlPanelSections: ({
        label: string;
        expanded: boolean;
        controlSetRows: (string[] | {
            name: string;
            config: {
                type: string;
                label: string;
                description: string;
            };
        }[])[];
    } | {
        label: string;
        expanded: boolean;
        controlSetRows: import("@arthanasti/chart-controls").CustomControlItem[][];
    })[];
    controlOverrides: {
        y_axis_format: {
            label: string;
        };
    };
};
export default _default;
//# sourceMappingURL=controlPanel.d.ts.map