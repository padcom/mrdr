import { AllowedComponentProps } from 'vue';
import { ComponentCustomProps } from 'vue';
import { ComponentOptionsMixin } from 'vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { VNodeProps } from 'vue';

export declare const HelloWorld: DefineComponent<{
    message: {
        type: StringConstructor;
        default: string;
    };
}, {}, unknown, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, VNodeProps & AllowedComponentProps & ComponentCustomProps, Readonly<ExtractPropTypes<{
    message: {
        type: StringConstructor;
        default: string;
    };
}>>, {
    message: string;
}, {}>;

export { }
