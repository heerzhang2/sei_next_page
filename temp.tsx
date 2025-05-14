import {Button} from "./mainProj/src/components/ui";

const scrollEndOrTop = (e: React.MouseEvent) => {
    // This is crucial - we need to stop the event completely
    e.preventDefault();
    e.stopPropagation();
    // if(setActiveTab!==null)  setActiveTab("preview");
    // setIsDialogOpen(true);
    return false; // Ensure no further handling
}
<div
    className="print:hidden xl:hidden fixed top-4 right-4 z-[1000]"
    style={{ isolation: 'isolate' }} // Creates a new stacking context
>
    <Button
        onClick={scrollEndOrTop}
        className="h-8 flex-shrink-0 items-center justify-center gap-0 overflow-hidden rounded-full px-2 text-sm font-medium shadow-lg"
    >
        {'下'}
    </Button>
</div>
<div id='EHEAD'/>
{recordList}
<div id='ETAIL'/>