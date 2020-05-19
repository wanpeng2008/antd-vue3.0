import classNames from 'classnames';
import omit from 'lodash/omit';
import * as moment from 'moment';
import {getCurrentInstance} from 'vue';
import BaseMixin from '../_util/base-mixin';
import interopDefault from '../_util/interopDefault';
import {
  getComponentFromProp,
  getListeners,
  getOptionProps,
  hasProp,
  initDefaultProps,
  isValidElement,
  mergeProps
} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import MonthCalendar from '../vc-calendar/src/month-calendar';
import VcDatePicker from '../vc-calendar/src/picker';
import {formatDate} from './utils';

// export const PickerProps = {
//   value?: moment.Moment;
//   prefixCls: string;
// }
function noop() {
}

export default function createPicker(TheCalendar, props) {
  return {
    props: initDefaultProps(props, {
      allowClear: true,
      showToday: true
    }),
    mixins: [BaseMixin],
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      const value = this.value || this.defaultValue;
      if (value && !interopDefault(moment).isMoment(value)) {
        throw new Error(
          'The value/defaultValue of DatePicker or MonthPicker must be ' + 'a moment object'
        );
      }
      return {
        sValue: value,
        showDate: value,
        _open: !!this.open
      };
    },
    watch: {
      open(val) {
        const props = getOptionProps(this);
        const state = {};
        state._open = val;
        if ('value' in props && !val && props.value !== this.showDate) {
          state.showDate = props.value;
        }
        this.setState(state);
      },
      value(val) {
        const state = {};
        state.sValue = val;
        if (val !== this.sValue) {
          state.showDate = val;
        }
        this.setState(state);
      },
      _open(val, oldVal) {
        this.$nextTick(() => {
          if (!hasProp(this, 'open') && oldVal && !val) {
            this.focus();
          }
        });
      }
    },
    methods: {
      clearSelection(e) {
        e.preventDefault();
        e.stopPropagation();
        this.handleChange(null);
      },

      handleChange(value) {
        if (!hasProp(this, 'value')) {
          this.setState({
            sValue: value,
            showDate: value
          });
        }
        this.$emit('change', value, formatDate(value, this.format));
      },

      handleCalendarChange(value) {
        this.setState({showDate: value});
      },
      handleOpenChange(open) {
        const props = getOptionProps(this);
        if (!('open' in props)) {
          this.setState({_open: open});
        }
        this.$emit('openChange', open);
      },
      focus() {
        this.$refs.input.focus();
      },

      blur() {
        this.$refs.input.blur();
      },
      renderFooter(...args) {
        const {$scopedSlots, $slots, _prefixCls: prefixCls} = this;
        const renderExtraFooter =
          this.renderExtraFooter || $scopedSlots.renderExtraFooter || $slots.renderExtraFooter;
        return renderExtraFooter ? (
          <div class={`${prefixCls}-footer-extra`}>
            {typeof renderExtraFooter === 'function'
              ? renderExtraFooter(...args)
              : renderExtraFooter}
          </div>
        ) : null;
      },
      onMouseEnter(e) {
        this.$emit('mouseenter', e);
      },
      onMouseLeave(e) {
        this.$emit('mouseleave', e);
      }
    },
    setup() {
      return {
        configProvider: useConfigProvider()
      };
    },
    render(ctx) {
      const instance = getCurrentInstance();
      const {sValue: value, showDate, _open: open} = this.$data;
      let suffixIcon = getComponentFromProp(instance, 'suffixIcon');
      suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
      const listeners = getListeners(this);
      const {panelChange = noop, focus = noop, blur = noop, ok = noop} = listeners;
      const {prefixCls: customizePrefixCls, locale, localeCode, inputReadOnly} = props;
      const getPrefixCls = ctx.configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('calendar', customizePrefixCls);
      this._prefixCls = prefixCls;

      const dateRender = getComponentFromProp(instance, 'dateRender');
      const monthCellContentRender =
        getComponentFromProp(instance, 'monthCellContentRender');
      const placeholder = 'placeholder' in props ? props.placeholder : locale.lang.placeholder;

      const disabledTime = props.showTime ? props.disabledTime : null;

      const calendarClassName = classNames({
        [`${prefixCls}-time`]: props.showTime,
        [`${prefixCls}-month`]: MonthCalendar === TheCalendar
      });

      if (value && localeCode) {
        value.locale(localeCode);
      }

      const pickerProps = {props: {}, on: {}};
      const calendarProps = {props: {}, on: {}};
      const pickerStyle = {};
      if (props.showTime) {
        // fix https://github.com/ant-design/ant-design/issues/1902
        calendarProps.on.select = this.handleChange;
        pickerStyle.minWidth = '195px';
      } else {
        pickerProps.on.change = this.handleChange;
      }
      if ('mode' in props) {
        calendarProps.props.mode = props.mode;
      }
      const theCalendarProps = mergeProps(calendarProps, {
        props: {
          disabledDate: props.disabledDate,
          disabledTime,
          locale: locale.lang,
          timePicker: props.timePicker,
          defaultValue: props.defaultPickerValue || interopDefault(moment)(),
          dateInputPlaceholder: placeholder,
          prefixCls,
          dateRender,
          format: props.format,
          showToday: props.showToday,
          monthCellContentRender,
          renderFooter: this.renderFooter,
          value: showDate,
          inputReadOnly
        },
        on: {
          ok,
          panelChange,
          change: this.handleCalendarChange
        },
        class: calendarClassName
      });
      const calendar = <TheCalendar {...theCalendarProps} />;

      const clearIcon =
        !props.disabled && props.allowClear && value ? (
          <Icon
            type="close-circle"
            class={`${prefixCls}-picker-clear`}
            onClick={this.clearSelection}
            theme="filled"
          />
        ) : null;

      const inputIcon = (suffixIcon &&
        (isValidElement(suffixIcon) ? (
          cloneElement(suffixIcon, {
            class: `${prefixCls}-picker-icon`
          })
        ) : (
          <span class={`${prefixCls}-picker-icon`}>{suffixIcon}</span>
        ))) || <Icon type="calendar" class={`${prefixCls}-picker-icon`}/>;

      const input = ({value: inputValue}) => {
        return (
            <div>
              <input
                  ref="input"
                  disabled={props.disabled}
                  onFocus={focus}
                  onBlur={blur}
                  readonly={true}
                  value={formatDate(inputValue, this.format)}
                  placeholder={placeholder}
                  class={props.pickerInputClass}
                  tabindex={props.tabIndex}
                  name={this.name}
              />
              {clearIcon}
              {inputIcon}
            </div>
        );
      };
      const vcDatePickerProps = {
        ...props,
        ...pickerProps.props,
        calendar,
        value,
        prefixCls: `${prefixCls}-picker-container`,
        ...omit(listeners, 'change'),
        ...pickerProps.on,
        onOpen: open,
        onOpenChange: this.handleOpenChange,
        style: props.popupStyle
      };
      return (
        <span
          class={props.pickerClass}
          style={pickerStyle}
          // tabIndex={props.disabled ? -1 : 0}
          // onFocus={focus}
          // onBlur={blur}
          onMouseenter={this.onMouseEnter}
          onMouseleave={this.onMouseLeave}>
        <VcDatePicker
            slots={{ ...this.$slots, default: input }}
            {...vcDatePickerProps}/>
      </span>
      );
    }
  };
}
