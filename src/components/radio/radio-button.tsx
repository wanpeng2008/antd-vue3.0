import {useRadioGroupContext} from '@/components/radio/group';
import {defineComponent, getCurrentInstance} from 'vue';
import {getListenersFromProps, getListenersFromInstance, getOptionProps} from '../_util/props-util';
import {useConfigProvider} from '../config-provider';
import Radio from './radio';

export default defineComponent({
  name: 'ARadioButton',
  props: {
    ...Radio.props
  },
  setup() {
    const radioGroup = useRadioGroupContext();
    return {radioGroup};
  },
  render(ctx) {
    const currentInstance = getCurrentInstance();
    const {prefixCls: customizePrefixCls, ...otherProps} = getOptionProps(currentInstance);
    const {getPrefixCls} = useConfigProvider();
    const prefixCls = getPrefixCls('radio-button', customizePrefixCls);

    const radioProps = {
      ...otherProps,
      prefixCls,
      ...getListenersFromInstance(currentInstance)
    };
    if (ctx.radioGroup) {
      radioProps.onChange = ctx.radioGroup.onRadioChange;
      radioProps.checked = this.$props.value === ctx.radioGroup.value?.value;
      radioProps.disabled = this.$props.disabled || ctx.radioGroup.disabled;
    }
    return <Radio {...radioProps}>{this.$slots.default && this.$slots.default()}</Radio>;
  }
});
