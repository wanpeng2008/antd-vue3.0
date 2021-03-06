import {defineComponent} from 'vue';
import PropTypes from './vue-types';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.name || 'Component';
}

export default function wrapWithConnect(WrappedComponent) {
  const tempProps = WrappedComponent.props || {};
  const methods = WrappedComponent.methods || {};
  const componentProps = {};
  Object.keys(tempProps).forEach(k => {
    componentProps[k] = {...tempProps[k], required: false};
  });
  WrappedComponent.props.__propsSymbol__ = PropTypes.any;
  WrappedComponent.props.children = PropTypes.array.def([]);
  const ProxyWrappedComponent = defineComponent({
    props: componentProps,
    model: WrappedComponent.model,
    name: `Proxy_${getDisplayName(WrappedComponent)}`,
    methods: {
      getProxyWrappedInstance() {
        return this.$refs.wrappedInstance;
      }
    },
    render() {
      const props = this.$props;
      const {$slots = {}} = this;
      const wrapProps: any = {
        ...props,
        ...this.$attrs,
        __propsSymbol__: Symbol(),
        componentWillReceiveProps: {...props},
        children: $slots.default || props['children'] || []
      };
      if (Object.keys($slots).length) {
        wrapProps.slots = $slots;
      }
      const slotsKey = Object.keys($slots);
      return (
          <WrappedComponent {...wrapProps} ref="wrappedInstance">
            {slotsKey.length
                ? slotsKey.map(name => {
                  return <template slot={name}>{$slots[name] && $slots[name]()}</template>;
                })
                : null}
          </WrappedComponent>
      );
    }
  });
  Object.keys(methods).map(m => {
    ProxyWrappedComponent.methods[m] = function() {
      return this.getProxyWrappedInstance()[m](...arguments);
    };
  });
  return ProxyWrappedComponent;
}
