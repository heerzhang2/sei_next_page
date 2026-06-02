import { subRepConfigToTagList } from "@/component/rep/sub-rep";
import {registerUrl} from "@/report/industrial/Periodical/indPipelineO1";
import {SUBREP_CONFIG} from "@/report/industrial/Periodical/indPipelineR1";
export const cacheUrls: string[] = registerUrl("INDPL_DJ","1")
export const changeTime: number = new Date("2026-03-18 09:03:00").getTime();
export const SUBREP_TAG_LIST: Array<{tag: string; name: string}> = subRepConfigToTagList(SUBREP_CONFIG);
