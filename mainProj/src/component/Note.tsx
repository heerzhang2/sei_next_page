import { ReactNode } from 'react';
import AnimateItems from './AnimateItems';
import { IoInformationCircleOutline } from 'react-icons/io5';
// import { clsx } from 'clsx/lite';
// export default function Note(props: {
//   icon?: ReactNode
// } & ComponentProps<typeof Container>) {

export default function Note(props: {
  icon?: ReactNode
  animate?: boolean
  cta?: ReactNode
  hideIcon?: boolean , children: ReactNode
} ) {
  const {
    icon,
    animate,
    cta,
    hideIcon,
    children,
    ...rest
  } = props;

  return (
    <AnimateItems
      type={animate ? 'bottom' : 'none'}
      items={[
        <div
          {...rest}
          key="Banner"
        >
          <div  >
            {!hideIcon &&
              <span  >
                {icon ?? <IoInformationCircleOutline
                  size={19}
                  className="translate-x-[0.5px] translate-y-[0.5px]"
                />}
              </span>}
            <span className="text-sm grow">
              {children}
            </span>
            {cta &&
              <span>
                {cta}
              </span>}
          </div>
        </div>,
      ]}
      animateOnFirstLoadOnly
    />
  );
}
