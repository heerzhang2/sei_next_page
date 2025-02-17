import * as React from "react";
import  {createFocusTrap, FocusTrap } from "focus-trap";

interface Options {
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
}

export function useFocusLockElement(
  elementRef: React.MutableRefObject<HTMLDivElement | null>,
  // showing: boolean,
  options: Options = {}
) {
  let trap= createFocusTrap(elementRef.current!, {
    initialFocus: elementRef.current!,
    escapeDeactivates: false,
    clickOutsideDeactivates: true,
    fallbackFocus: '[tabindex="-1"]',
    ...options
  });
  console.log("新的高策createFocusTrap wai=",trap);
  React.useEffect(() => {
    if (elementRef.current &&  !trap) {
      trap = createFocusTrap(elementRef.current!, {
        initialFocus: elementRef.current,
        escapeDeactivates: false,
        clickOutsideDeactivates: true,
        fallbackFocus: '[tabindex="-1"]',
        ...options
      });
      console.log("新的高策createFocusTrapn=",trap);
    }
    function focusElement() {
      trap.activate();
    }

    function focusTrigger() {
      if (!trap) {
        return;
      }

      trap.deactivate();
    }

    focusElement();
    return () => {
      focusTrigger();
    };

  }, [elementRef.current]);

  return {
    trap : ()=>{

      if(trap) {
        trap.activate();
        console.log("新的高策activate",trap);
        }
    }
  }
}

