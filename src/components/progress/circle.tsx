import {Circle as VCCircle} from '../vc-progress';
import {validProgress} from './utils';

const statusColorMap = {
  normal: '#108ee9',
  exception: '#ff5500',
  success: '#87d068'
};

function getPercentage({percent, successPercent}) {
  const ptg = validProgress(percent);
  if (!successPercent) {
    return ptg;
  }

  const successPtg = validProgress(successPercent);
  return [successPercent, validProgress(ptg - successPtg)];
}

function getStrokeColor({progressStatus, successPercent, strokeColor}) {
  const color = strokeColor || statusColorMap[progressStatus];
  if (!successPercent) {
    return color;
  }
  return [statusColorMap.success, color];
}

const Circle = (props, {slots}) => {
  const {
    prefixCls,
    width,
    strokeWidth,
    trailColor,
    strokeLinecap,
    gapPosition,
    gapDegree,
    type
  } = props;
  const circleSize = width || 120;
  const circleStyle = {
    width: typeof circleSize === 'number' ? `${circleSize}px` : circleSize,
    height: typeof circleSize === 'number' ? `${circleSize}px` : circleSize,
    fontSize: circleSize * 0.15 + 6
  };
  const circleWidth = strokeWidth || 6;
  const gapPos = gapPosition || (type === 'dashboard' && 'bottom') || 'top';
  const gapDeg = gapDegree || (type === 'dashboard' && 75);
  const strokeColor = getStrokeColor(props);
  const isGradient = Object.prototype.toString.call(strokeColor) === '[object Object]';

  const wrapperClassName = {
    [`${prefixCls}-inner`]: true,
    [`${prefixCls}-circle-gradient`]: isGradient
  };

  return (
      <div class={wrapperClassName} style={circleStyle}>
        <VCCircle
            percent={getPercentage(props)}
            strokeWidth={circleWidth}
            trailWidth={circleWidth}
            strokeColor={strokeColor}
            strokeLinecap={strokeLinecap}
            trailColor={trailColor}
            prefixCls={prefixCls}
            gapDegree={gapDeg}
            gapPosition={gapPos}
        />
        {slots.default && slots.default()}
      </div>
  );
};

export default Circle;
