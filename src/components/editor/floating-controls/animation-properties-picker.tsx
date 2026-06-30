import { useState, useEffect } from "react";
import {
  ANIMATABLE_PROPERTIES,
  AnimationProps,
  KeyframeData,
  WipeDirection,
  type MaskTransform,
} from "@openvideo/engine-pixi";
import {
  getPresetKeyframes,
  SPECIAL_ANIMATIONS_CAPTIONS,
  GSAP_PRESETS,
} from "@/lib/animation-presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { NumberInput } from "@/components/ui/number-input";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiPlayLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useLayoutStore from "../store/use-layout-store";
import { useStudioStore } from "@/stores/studio-store";
import { core } from "@/lib/project";
import { Switch } from "@/components/ui/switch";
import * as Popover from "@radix-ui/react-popover";

type PropertyKey = keyof typeof ANIMATABLE_PROPERTIES;

interface PresetDefinition {
  id: string;
  label: string;
  category: "transition" | "text" | "combo";
  hasInOut: boolean;
  inType: string;
  outType?: string;
}

const UI_PRESETS: PresetDefinition[] = [
  // Transitions
  {
    id: "fade",
    label: "Fade",
    category: "transition",
    hasInOut: true,
    inType: "fadeIn",
    outType: "fadeOut",
  },
  {
    id: "zoom",
    label: "Zoom",
    category: "transition",
    hasInOut: true,
    inType: "zoomIn",
    outType: "zoomOut",
  },
  {
    id: "slide",
    label: "Slide",
    category: "transition",
    hasInOut: true,
    inType: "slideIn",
    outType: "slideOut",
  },
  {
    id: "blur",
    label: "Blur",
    category: "transition",
    hasInOut: true,
    inType: "blurIn",
    outType: "blurOut",
  },
  {
    id: "wipe",
    label: "Wipe",
    category: "transition",
    hasInOut: true,
    inType: "wipeIn",
    outType: "wipeOut",
  },
  {
    id: "circleReveal",
    label: "Circle Reveal",
    category: "transition",
    hasInOut: true,
    inType: "circleRevealIn",
    outType: "circleRevealOut",
  },
  {
    id: "rectExpand",
    label: "Rect Expand",
    category: "transition",
    hasInOut: true,
    inType: "rectExpandIn",
    outType: "rectExpandOut",
  },
  {
    id: "angleWipe",
    label: "Angle Wipe",
    category: "transition",
    hasInOut: true,
    inType: "angleWipeIn",
    outType: "angleWipeOut",
  },
  {
    id: "centerExpand",
    label: "Center Expand",
    category: "transition",
    hasInOut: true,
    inType: "centerExpandIn",
    outType: "centerExpandOut",
  },
  {
    id: "pulse",
    label: "Pulse",
    category: "transition",
    hasInOut: true,
    inType: "pulse",
    outType: "pulse",
  },

  {
    id: "appearByWord",
    label: "Appear",
    category: "text",
    hasInOut: true,
    inType: "appearByWord",
    outType: "appearByWord",
  },
  {
    id: "fadeByWord",
    label: "Fade By Word",
    category: "text",
    hasInOut: true,
    inType: "fadeByWord",
    outType: "fadeByWord",
  },

  // Text Animations
  {
    id: "popCaption",
    label: "Pop",
    category: "text",
    hasInOut: true,
    inType: "popCaption",
    outType: "popCaption",
  },
  {
    id: "bounceCaption",
    label: "Bounce",
    category: "text",
    hasInOut: true,
    inType: "bounceCaption",
    outType: "bounceCaption",
  },
  {
    id: "scaleCaption",
    label: "Scale",
    category: "text",
    hasInOut: true,
    inType: "scaleCaption",
    outType: "scaleCaption",
  },
  {
    id: "slideCaption",
    label: "Slide",
    category: "text",
    hasInOut: true,
    inType: "slideLeftCaption",
    outType: "slideLeftCaption",
  },
  {
    id: "slideByWord",
    label: "Slide By Word",
    category: "text",
    hasInOut: true,
    inType: "slideByWord",
    outType: "slideByWord",
  },
  {
    id: "slideMaskWord",
    label: "Slide Mask Word",
    category: "text",
    hasInOut: true,
    inType: "slideMaskWord",
    outType: "slideMaskWord",
  },
  {
    id: "blockReveal",
    label: "Block Reveal",
    category: "text",
    hasInOut: true,
    inType: "blockRevealIn",
    outType: "blockRevealOut",
  },

  {
    id: "charFade",
    label: "Char Fade",
    category: "text",
    hasInOut: true,
    inType: "charFade",
    outType: "charFade",
  },
  {
    id: "charSlideUp",
    label: "Char Slide Up",
    category: "text",
    hasInOut: true,
    inType: "charSlideUp",
    outType: "charSlideUp",
  },
  {
    id: "charTypewriter",
    label: "Char Typewriter",
    category: "text",
    hasInOut: true,
    inType: "charTypewriter",
    outType: "charTypewriter",
  },

  {
    id: "popByWord",
    label: "Pop By Word",
    category: "text",
    hasInOut: true,
    inType: "popByWord",
    outType: "popByWord",
  },
  {
    id: "scaleFadeByWord",
    label: "Scale Fade By Word",
    category: "text",
    hasInOut: true,
    inType: "scaleFadeByWord",
    outType: "scaleFadeByWord",
  },
  {
    id: "bounceByWord",
    label: "Bounce By Word",
    category: "text",
    hasInOut: true,
    inType: "bounceByWord",
    outType: "bounceByWord",
  },
  {
    id: "rotateByWord",
    label: "Rotate By Word",
    category: "text",
    hasInOut: true,
    inType: "rotateByWord",
    outType: "rotateByWord",
  },

  {
    id: "fadeRotateByWord",
    label: "Fade Rotate By Word",
    category: "text",
    hasInOut: true,
    inType: "fadeRotateByWord",
    outType: "fadeRotateByWord",
  },
  {
    id: "skewByWord",
    label: "Skew By Word",
    category: "text",
    hasInOut: true,
    inType: "skewByWord",
    outType: "skewByWord",
  },
  {
    id: "waveByWord",
    label: "Wave By Word",
    category: "text",
    hasInOut: true,
    inType: "waveByWord",
    outType: "waveByWord",
  },
  {
    id: "blurByWord",
    label: "Blur By Word",
    category: "text",
    hasInOut: true,
    inType: "blurByWord",
    outType: "blurByWord",
  },
  {
    id: "dropSoftByWord",
    label: "Drop Soft By Word",
    category: "text",
    hasInOut: true,
    inType: "dropSoftByWord",
    outType: "dropSoftByWord",
  },
  {
    id: "elasticPopByWord",
    label: "Elastic Pop By Word",
    category: "text",
    hasInOut: true,
    inType: "elasticPopByWord",
    outType: "elasticPopByWord",
  },
  {
    id: "flipUpByWord",
    label: "Flip Up By Word",
    category: "text",
    hasInOut: true,
    inType: "flipUpByWord",
    outType: "flipUpByWord",
  },
  {
    id: "spinByWord",
    label: "Spin By Word",
    category: "text",
    hasInOut: true,
    inType: "spinByWord",
    outType: "spinByWord",
  },
  {
    id: "stretchByWord",
    label: "Stretch By Word",
    category: "text",
    hasInOut: true,
    inType: "stretchByWord",
    outType: "stretchByWord",
  },
  {
    id: "revealZoomByWord",
    label: "Reveal Zoom By Word",
    category: "text",
    hasInOut: true,
    inType: "revealZoomByWord",
    outType: "revealZoomByWord",
  },
  {
    id: "floatWaveByWord",
    label: "Float Wave By Word",
    category: "text",
    hasInOut: true,
    inType: "floatWaveByWord",
    outType: "floatWaveByWord",
  },

  // Combos
  {
    id: "comboZoom1",
    label: "Combo Zoom 1",
    category: "combo",
    hasInOut: false,
    inType: "comboZoom1",
  },
  {
    id: "comboZoom2",
    label: "Combo Zoom 2",
    category: "combo",
    hasInOut: false,
    inType: "comboZoom2",
  },
  {
    id: "comboPendulum1",
    label: "Combo Pendulum 1",
    category: "combo",
    hasInOut: false,
    inType: "comboPendulum1",
  },
  {
    id: "comboPendulum2",
    label: "Combo Pendulum 2",
    category: "combo",
    hasInOut: false,
    inType: "comboPendulum2",
  },
  {
    id: "comboRightDistort",
    label: "Combo Right Distort",
    category: "combo",
    hasInOut: false,
    inType: "comboRightDistort",
  },
  {
    id: "comboLeftDistort",
    label: "Combo Left Distort",
    category: "combo",
    hasInOut: false,
    inType: "comboLeftDistort",
  },
  {
    id: "comboWobble",
    label: "Combo Wobble",
    category: "combo",
    hasInOut: false,
    inType: "comboWobble",
  },
  {
    id: "comboSpinningTop1",
    label: "Combo Spinning Top 1",
    category: "combo",
    hasInOut: false,
    inType: "comboSpinningTop1",
  },
  {
    id: "comboSpinningTop2",
    label: "Combo Spinning Top 2",
    category: "combo",
    hasInOut: false,
    inType: "comboSpinningTop2",
  },
  {
    id: "comboSwayOut",
    label: "Combo Sway Out",
    category: "combo",
    hasInOut: false,
    inType: "comboSwayOut",
  },
  {
    id: "comboBounce1",
    label: "Combo Bounce 1",
    category: "combo",
    hasInOut: false,
    inType: "comboBounce1",
  },
  {
    id: "comboSwayIn",
    label: "Combo Sway In",
    category: "combo",
    hasInOut: false,
    inType: "comboSwayIn",
  },
];

function reverseKeyframes(
  keyframes: Record<string, Partial<AnimationProps>>,
): Record<string, Partial<AnimationProps>> {
  const reversed: Record<string, Partial<AnimationProps>> = {};
  Object.entries(keyframes).forEach(([key, val]) => {
    const match = key.match(/(\d+)%/);
    if (match) {
      const pct = parseInt(match[1]);
      const newPct = 100 - pct;
      reversed[`${newPct}%`] = val;
    } else {
      reversed[key] = val;
    }
  });
  return reversed;
}

function getCanonicalKeyframesString(keyframes: Record<string, Partial<AnimationProps>>): string {
  const sortedKeys = Object.keys(keyframes)
    .filter((k) => k.endsWith("%") || k === "from" || k === "to")
    .sort((a, b) => {
      const aNum = parseInt(a) || 0;
      const bNum = parseInt(b) || 0;
      return aNum - bNum;
    });

  const canonical: Record<string, any> = {};
  sortedKeys.forEach((k) => {
    const props = (keyframes[k] || {}) as any;
    const sortedProps: Record<string, any> = {};
    Object.keys(props)
      .sort()
      .forEach((p) => {
        sortedProps[p] = props[p];
      });
    canonical[k] = sortedProps;
  });

  return JSON.stringify(canonical);
}

function getPresetIdAndMode(
  animation: any,
  clipDuration: number,
): { presetId: string; mode: "in" | "out" } {
  if (!animation) return { presetId: "", mode: "in" };

  if (animation.options?.presetId) {
    let presetId = animation.options.presetId;
    if (presetId === "charFadeIn") presetId = "charFade";
    if (presetId === "rotateInByWord") presetId = "rotateByWord";
    if (presetId === "blurInByWord") presetId = "blurByWord";
    if (presetId === "spinInByWord") presetId = "spinByWord";
    if (presetId === "stretchInByWord") presetId = "stretchByWord";
    return {
      presetId,
      mode: animation.options.mode || "in",
    };
  }

  if (animation.params?.presetId) {
    let presetId = animation.params.presetId;
    if (presetId === "charFadeIn") presetId = "charFade";
    if (presetId === "rotateInByWord") presetId = "rotateByWord";
    if (presetId === "blurInByWord") presetId = "blurByWord";
    if (presetId === "spinInByWord") presetId = "spinByWord";
    if (presetId === "stretchInByWord") presetId = "stretchByWord";
    return {
      presetId,
      mode: animation.params.metaMode || animation.params.mode || "in",
    };
  }

  const t = animation.type;
  const params = animation.params || {};

  const maskTypes = ["wipe", "circleReveal", "rectExpand", "angleWipe", "centerExpand"];
  if (maskTypes.includes(t)) {
    const isConceal = params.mode === "conceal";
    return {
      presetId: t,
      mode: isConceal ? "out" : "in",
    };
  }

  const currentDelayMicro = animation.options?.delay || 0;
  const currentDurationMicro = animation.options?.duration || 0;
  const isOut =
    animation.type.toLowerCase().includes("out") ||
    (currentDelayMicro > 0 &&
      Math.abs(currentDelayMicro + currentDurationMicro - clipDuration) < 1000);
  const mode = isOut ? "out" : "in";

  if (t === "keyframes") {
    // 1. Special check for Transition Slide
    const hasOpacity =
      params["0%"]?.hasOwnProperty("opacity") || params["100%"]?.hasOwnProperty("opacity");
    const hasSlideCoords =
      params["0%"]?.hasOwnProperty("x") ||
      params["0%"]?.hasOwnProperty("y") ||
      params["100%"]?.hasOwnProperty("x") ||
      params["100%"]?.hasOwnProperty("y");
    if (hasOpacity && hasSlideCoords && !params["0%"]?.hasOwnProperty("blur")) {
      return { presetId: "slide", mode };
    }

    // 2. Special check for Text Slide
    const textSlideKeys = [
      "slideLeftCaption",
      "slideRightCaption",
      "slideUpCaption",
      "slideDownCaption",
    ];
    for (const key of textSlideKeys) {
      let template = getPresetKeyframes(key);
      if (mode === "out") {
        template = reverseKeyframes(template);
      }
      if (getCanonicalKeyframesString(template) === getCanonicalKeyframesString(params)) {
        return { presetId: "slideCaption", mode };
      }
    }

    // 3. Fallback check for all other keyframe presets
    for (const preset of UI_PRESETS) {
      if (preset.id === "slide" || preset.id === "slideCaption") continue;
      if (
        preset.category === "combo" ||
        (preset.category === "transition" && !(preset.inType in GSAP_PRESETS)) ||
        (preset.category === "text" && !(preset.inType in GSAP_PRESETS))
      ) {
        const coreKey = preset.hasInOut
          ? mode === "in"
            ? preset.inType
            : preset.outType || preset.inType
          : preset.inType;

        let template = getPresetKeyframes(coreKey);

        if (mode === "out" && preset.inType === preset.outType) {
          template = reverseKeyframes(template);
        }

        if (getCanonicalKeyframesString(template) === getCanonicalKeyframesString(params)) {
          return { presetId: preset.id, mode };
        }
      }
    }
  }

  if (t === "stagger") {
    for (const [presetKey, config] of Object.entries(GSAP_PRESETS)) {
      let templateParams = config.params;

      if (mode === "out") {
        templateParams = {
          ...templateParams,
          from: config.params.to,
          to: config.params.from,
        };
      }

      if (
        templateParams?.type === params.type &&
        JSON.stringify(templateParams?.from) === JSON.stringify(params.from)
      ) {
        const matchingDef = UI_PRESETS.find((p) => p.inType === presetKey);
        if (matchingDef) {
          return { presetId: matchingDef.id, mode };
        }
      }
    }
  }

  return { presetId: "", mode };
}

export function AnimationPropertiesPicker() {
  const { floatingControlData, setFloatingControl } = useLayoutStore();
  const { studio } = useStudioStore();

  const [rightPanelRect, setRightPanelRect] = useState<{
    right: number;
    top: number;
    width: number;
  }>({
    right: 280,
    top: 64,
    width: 280,
  });

  useEffect(() => {
    const el = document.querySelector(".right-resizable-panel");
    if (!el) return;

    const updateRect = () => {
      const rect = el.getBoundingClientRect();
      setRightPanelRect({
        right: window.innerWidth - rect.left,
        top: rect.top,
        width: rect.width,
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      updateRect();
    });

    resizeObserver.observe(el);
    updateRect();

    window.addEventListener("resize", updateRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  const { clipId, animationId, mode } = floatingControlData || {};
  const clip = studio?.getClipById(clipId) as any;
  const animation = animationId ? clip?.animations.find((a: any) => a.id === animationId) : null;
  const clipDuration = clip?.duration || 0;
  const typeClip = clip?.type || "";

  const [activeTab, setActiveTab] = useState<string>("presets");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<"in" | "out">("in");

  const [presetParams, setPresetParams] = useState<any>({
    direction: "left",
    distance: 300,
    stagger: 0.05,
    wipeDirection: "left",
    maskOrigin: "center",
    maskAngle: 0,
    maskAxis: "vertical",
    maskInitialProgress: 0,
    blockColor: "#ffffff",
    textColorInside: "#000000",
    blockRevealMode: "reveal",
    blockSize: 0.3,
  });

  const [keyframes, setKeyframes] = useState<Record<string, Partial<AnimationProps>>>({
    "0%": {},
    "100%": {},
  });

  const [duration, setDuration] = useState<number>(1000);
  const [delay, setDelay] = useState<number>(0);
  const [iterCount, setIterCount] = useState<number>(1);
  const [easing, setEasing] = useState<string>("linear");
  const [mirrorEnabled, setMirrorEnabled] = useState<boolean>(false);

  // Initialize from animation
  useEffect(() => {
    if (animation) {
      const parsed = getPresetIdAndMode(animation, clipDuration);

      if (parsed.presetId) {
        setSelectedPreset(parsed.presetId);
        setSelectedMode(parsed.mode);
        setActiveTab("presets");
      } else {
        setSelectedPreset("");
        setSelectedMode(parsed.mode);
        setActiveTab(animation.type === "keyframes" ? "custom" : "presets");
      }

      if (animation.options?.duration) {
        setDuration(animation.options.duration / 1000);
      }
      setDelay((animation.options?.delay || 0) / 1000);
      setIterCount(animation.options?.iterCount || 1);
      setEasing(animation.options?.easing || "linear");

      if (animation.type === "keyframes") {
        setKeyframes(animation.params || { "0%": {}, "100%": {} });
        const hasMirror = Object.values(animation.params as KeyframeData).some(
          (p: any) => p && p.mirror > 0,
        );
        setMirrorEnabled(hasMirror);

        // If it is a Transition Slide, restore direction and distance!
        const parsed = getPresetIdAndMode(animation, clipDuration);
        if (parsed.presetId === "slide") {
          const params = animation.params || {};
          let dir = "left";
          let dist = 300;
          if (parsed.mode === "in") {
            const startX = params["0%"]?.x ?? 0;
            const startY = params["0%"]?.y ?? 0;
            if (startX < 0) {
              dir = "left";
              dist = Math.abs(startX);
            } else if (startX > 0) {
              dir = "right";
              dist = Math.abs(startX);
            } else if (startY < 0) {
              dir = "top";
              dist = Math.abs(startY);
            } else if (startY > 0) {
              dir = "bottom";
              dist = Math.abs(startY);
            }
          } else {
            const endX = params["100%"]?.x ?? 0;
            const endY = params["100%"]?.y ?? 0;
            if (endX < 0) {
              dir = "left";
              dist = Math.abs(endX);
            } else if (endX > 0) {
              dir = "right";
              dist = Math.abs(endX);
            } else if (endY < 0) {
              dir = "top";
              dist = Math.abs(endY);
            } else if (endY > 0) {
              dir = "bottom";
              dist = Math.abs(endY);
            }
          }
          setPresetParams((prev: any) => ({
            ...prev,
            direction: dir,
            distance: dist,
          }));
        }

        // If it is a Text Slide, restore direction!
        if (parsed.presetId === "slideCaption") {
          let dir = "left";
          const directions = ["left", "right", "top", "bottom"];
          const mapping: Record<string, string> = {
            left: "slideLeftCaption",
            right: "slideRightCaption",
            top: "slideUpCaption",
            bottom: "slideDownCaption",
          };
          for (const d of directions) {
            const coreKey = mapping[d];
            let template = getPresetKeyframes(coreKey);
            if (parsed.mode === "out") {
              template = reverseKeyframes(template);
            }
            if (
              getCanonicalKeyframesString(template) ===
              getCanonicalKeyframesString(animation.params)
            ) {
              dir = d;
              break;
            }
          }
          setPresetParams((prev: any) => ({
            ...prev,
            direction: dir,
          }));
        }
      } else {
        const maskTypes = ["wipe", "circleReveal", "rectExpand", "angleWipe", "centerExpand"];
        if (animation.type === "blockReveal") {
          setPresetParams((prev: any) => ({
            ...prev,
            blockColor: animation.params.blockColor ?? "#ffffff",
            textColorInside: animation.params.textColorInside ?? "#000000",
            direction: animation.params.direction ?? "right",
            blockRevealMode: animation.params.mode ?? "reveal",
            blockSize: animation.params.blockSize ?? 0.3,
          }));
        } else if (maskTypes.includes(animation.type)) {
          setPresetParams((prev: any) => ({
            ...prev,
            wipeDirection: animation.params.direction ?? "left",
            maskOrigin: animation.params.origin ?? "center",
            maskAngle: animation.params.angle ?? 0,
            axis: animation.params.axis ?? "vertical",
            initialProgress: animation.params.initialProgress ?? 0,
          }));
        } else if (animation.type === "stagger" && animation.params) {
          setPresetParams((prev: any) => {
            const next = {
              ...prev,
              stagger: animation.params.stagger ?? 0.05,
            };
            if (parsed.presetId === "slideByWord" || parsed.presetId === "slideMaskWord") {
              const from = animation.params.from || {};
              const to = animation.params.to || {};
              const keyframes = to.keyframes || {};
              const kf100 = keyframes["100%"] || {};

              let dir = "left";
              let dist = 50;
              const isOut = parsed.mode === "out";

              let xVal = from.x !== undefined ? from.x : to.x !== undefined ? to.x : kf100.x;
              let yVal = from.y !== undefined ? from.y : to.y !== undefined ? to.y : kf100.y;

              if (xVal !== undefined) {
                const strX = String(xVal);
                dist = Math.abs(parseFloat(strX.replace(/[^0-9.-]/g, ""))) || 50;
                if (isOut) {
                  if (strX.includes("-")) {
                    dir = "left";
                  } else {
                    dir = "right";
                  }
                } else {
                  if (strX.includes("+")) {
                    dir = "left";
                  } else {
                    dir = "right";
                  }
                }
              } else if (yVal !== undefined) {
                const strY = String(yVal);
                dist = Math.abs(parseFloat(strY.replace(/[^0-9.-]/g, ""))) || 50;
                if (isOut) {
                  if (strY.includes("-")) {
                    dir = "top";
                  } else {
                    dir = "bottom";
                  }
                } else {
                  if (strY.includes("+")) {
                    dir = "top";
                  } else {
                    dir = "bottom";
                  }
                }
              }
              next.direction = dir;
              next.distance = dist;
            }
            return next;
          });
        }
      }
    } else {
      setSelectedPreset("");
      setSelectedMode("in");
      setActiveTab("presets");
      setDuration(typeClip === "Caption" ? (clipDuration * 0.2) / 1000 : 1000);
      setDelay(0);
      setIterCount(1);
      setEasing("linear");
      setKeyframes({ "0%": {}, "100%": {} });
      setMirrorEnabled(false);
    }
  }, [animation, clipDuration, typeClip]);

  // Tab Change Handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "custom") {
      setSelectedPreset("");
      if (!animation || animation.type !== "keyframes") {
        setKeyframes({ "0%": {}, "100%": {} });
      }
    } else {
      setSelectedPreset("");
    }
  };

  // Sync 'Out' delay with duration
  useEffect(() => {
    const def = UI_PRESETS.find((p) => p.id === selectedPreset);
    const isCombo = def?.category === "combo";
    if (activeTab === "presets" && selectedMode === "out" && !isCombo) {
      const newDelay = Math.max(0, clipDuration / 1000 - duration);
      setDelay(newDelay);
    }
  }, [duration, clipDuration, activeTab, selectedMode, selectedPreset]);

  // Sync combo parameters (duration and mirror)
  useEffect(() => {
    const def = UI_PRESETS.find((p) => p.id === selectedPreset);
    if (activeTab === "presets" && def?.category === "combo") {
      setDuration(clipDuration / 1000);
      setMirrorEnabled(true);
    }
  }, [clipDuration, activeTab, selectedPreset]);

  // Sync stagger and distance parameters when preset changes
  useEffect(() => {
    if (activeTab === "presets" && selectedPreset) {
      const def = UI_PRESETS.find((p) => p.id === selectedPreset);
      if (def?.category === "text" && def.inType in GSAP_PRESETS) {
        const config = GSAP_PRESETS[def.inType];
        setPresetParams((prev: any) => {
          const next = { ...prev };
          if (config?.params?.stagger !== undefined) {
            next.stagger = config.params.stagger;
          }
          if (selectedPreset === "slideByWord" || selectedPreset === "slideMaskWord") {
            next.distance = 50;
          }
          return next;
        });
      }
    }
  }, [activeTab, selectedPreset]);

  const handlePropertyChange = (keyframe: string, property: PropertyKey, value: number) => {
    setKeyframes((prev) => ({
      ...prev,
      [keyframe]: {
        ...prev[keyframe],
        [property]: value,
      },
    }));
  };

  const handlePropertyToggle = (keyframe: string, property: PropertyKey, enabled: boolean) => {
    setKeyframes((prev) => {
      const newKeyframes = { ...prev };
      if (enabled) {
        newKeyframes[keyframe] = {
          ...newKeyframes[keyframe],
          [property]: ANIMATABLE_PROPERTIES[property].default,
        };
      } else {
        const { [property]: _, ...rest } = newKeyframes[keyframe] || {};
        newKeyframes[keyframe] = rest;
      }
      return newKeyframes;
    });
  };

  const handleAddKeyframe = () => {
    const existingProgress = Object.keys(keyframes)
      .map((k) => {
        const match = k.match(/(\d+)%/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    let newProgress = 50;
    if (existingProgress.length >= 2) {
      let maxGap = -1;
      let gapStart = 0;
      for (let i = 0; i < existingProgress.length - 1; i++) {
        const gap = existingProgress[i + 1] - existingProgress[i];
        if (gap > maxGap) {
          maxGap = gap;
          gapStart = existingProgress[i];
        }
      }
      if (maxGap > 5) {
        newProgress = Math.round(gapStart + maxGap / 2);
      } else {
        newProgress = Math.min(existingProgress[existingProgress.length - 1] + 10, 100);
      }
    }

    while (keyframes[`${newProgress}%`] && newProgress < 100) {
      newProgress++;
    }

    setKeyframes((prev) => ({
      ...prev,
      [`${newProgress}%`]: {},
    }));
  };

  const handleRemoveKeyframe = (keyframe: string) => {
    if (keyframe === "0%" || keyframe === "100%") return;
    setKeyframes((prev) => {
      const { [keyframe]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleRenameKeyframe = (oldKey: string, newKey: string) => {
    if (newKey === oldKey || newKey === "0%" || newKey === "100%") return;
    setKeyframes((prev) => {
      if (prev[newKey]) return prev;
      const { [oldKey]: props, ...rest } = prev;
      return { ...rest, [newKey]: props };
    });
  };

  const buildAnimationConfig = () => {
    let presetKey = "";
    let isMask = false;
    let isStagger = false;
    let isKeyframe = false;
    let def: PresetDefinition | undefined;

    if (activeTab === "presets" && selectedPreset) {
      def = UI_PRESETS.find((p) => p.id === selectedPreset);
      if (def) {
        if (selectedPreset === "slideCaption") {
          const dir = presetParams.direction ?? "left";
          const mapping: Record<string, string> = {
            left: "slideLeftCaption",
            right: "slideRightCaption",
            top: "slideUpCaption",
            bottom: "slideDownCaption",
          };
          presetKey = mapping[dir] || "slideLeftCaption";
        } else {
          presetKey = def.hasInOut
            ? selectedMode === "in"
              ? def.inType
              : def.outType || def.inType
            : def.inType;
        }
      }
    }

    const maskPresets = [
      "wipeIn",
      "wipeOut",
      "circleRevealIn",
      "circleRevealOut",
      "rectExpandIn",
      "rectExpandOut",
      "angleWipeIn",
      "angleWipeOut",
      "centerExpandIn",
      "centerExpandOut",
      "blockRevealIn",
      "blockRevealOut",
    ];
    if (presetKey && maskPresets.includes(presetKey)) {
      isMask = true;
    } else if (presetKey && presetKey in GSAP_PRESETS) {
      isStagger = true;
    } else if (activeTab === "presets" && presetKey) {
      isKeyframe = true;
    }

    const options: any = {
      duration: duration * 1000,
      delay: delay * 1000,
      iterCount,
      easing,
      presetId: activeTab === "presets" ? selectedPreset : undefined,
      mode: activeTab === "presets" ? selectedMode : undefined,
    };

    const type = isMask ? presetKey.replace(/In$|Out$/, "") : isStagger ? "stagger" : "keyframes";

    let finalParams: any = {};
    if (isMask) {
      if (type === "blockReveal") {
        finalParams = {
          blockColor: presetParams.blockColor ?? "#ffffff",
          textColorInside: presetParams.textColorInside ?? "#000000",
          direction: presetParams.direction ?? "right",
          mode: presetParams.blockRevealMode ?? "reveal",
          blockSize: presetParams.blockSize ?? 0.3,
        };
      } else {
        finalParams = {
          direction: presetParams.wipeDirection ?? "left",
          origin: presetParams.maskOrigin ?? "center",
          angle: presetParams.maskAngle ?? 0,
          axis: presetParams.maskAxis ?? "vertical",
          initialProgress: presetParams.maskInitialProgress ?? 0,
          mode: presetKey.endsWith("In") ? "reveal" : "conceal",
        };
      }
    } else if (isStagger) {
      const staggerPreset = GSAP_PRESETS[presetKey];
      finalParams = structuredClone(staggerPreset.params);
      if (presetKey === "slideByWord" || presetKey === "slideMaskWord") {
        const dir = presetParams.direction ?? "left";
        const dist = presetParams.distance ?? 50;
        if (presetKey === "slideMaskWord") {
          if (selectedMode === "in") {
            finalParams.from = { alpha: 0 };
            let toX = 0;
            let toY = 0;
            if (dir === "left") {
              finalParams.from.x = `+=${dist}`;
              toX = -dist;
            } else if (dir === "right") {
              finalParams.from.x = `-=${dist}`;
              toX = dist;
            } else if (dir === "top") {
              finalParams.from.y = `+=${dist}`;
              toY = -dist;
            } else if (dir === "bottom") {
              finalParams.from.y = `-=${dist}`;
              toY = dist;
            }
            finalParams.to = {
              keyframes: {
                "0%": { alpha: 1 },
                "100%": {
                  ...(toX !== 0 && { x: `${toX > 0 ? "+=" : "-="}${Math.abs(toX)}` }),
                  ...(toY !== 0 && { y: `${toY > 0 ? "+=" : "-="}${Math.abs(toY)}` }),
                },
              },
              ease: "none",
            };
          } else {
            finalParams.from = { alpha: 1 };
            let toX = 0;
            let toY = 0;
            if (dir === "left") {
              toX = -dist;
            } else if (dir === "right") {
              toX = dist;
            } else if (dir === "top") {
              toY = -dist;
            } else if (dir === "bottom") {
              toY = dist;
            }
            finalParams.to = {
              keyframes: {
                "0%": { alpha: 1 },
                "99.9%": { alpha: 1 },
                "100%": {
                  alpha: 0,
                  ...(toX !== 0 && { x: `${toX > 0 ? "+=" : "-="}${Math.abs(toX)}` }),
                  ...(toY !== 0 && { y: `${toY > 0 ? "+=" : "-="}${Math.abs(toY)}` }),
                },
              },
              ease: "none",
            };
          }
        } else {
          // Standard slideByWord (fades opacity and slides)
          if (selectedMode === "in") {
            finalParams.from = { alpha: 0 };
            finalParams.to = { alpha: 1 };
            if (dir === "left") {
              finalParams.from.x = `+=${dist}`;
              finalParams.to.x = `-=${dist}`;
            } else if (dir === "right") {
              finalParams.from.x = `-=${dist}`;
              finalParams.to.x = `+=${dist}`;
            } else if (dir === "top") {
              finalParams.from.y = `+=${dist}`;
              finalParams.to.y = `-=${dist}`;
            } else if (dir === "bottom") {
              finalParams.from.y = `-=${dist}`;
              finalParams.to.y = `+=${dist}`;
            }
          } else {
            // Out mode: starts at alpha: 1 (neutral position) and animates to alpha: 0 (shifted position)
            finalParams.from = { alpha: 1 };
            finalParams.to = { alpha: 0 };
            if (dir === "left") {
              finalParams.to.x = `-=${dist}`;
            } else if (dir === "right") {
              finalParams.to.x = `+=${dist}`;
            } else if (dir === "top") {
              finalParams.to.y = `-=${dist}`;
            } else if (dir === "bottom") {
              finalParams.to.y = `+=${dist}`;
            }
          }
        }
      }
      if (selectedMode === "out" && presetKey !== "slideMaskWord" && presetKey !== "slideByWord") {
        const temp = finalParams.from;
        finalParams.from = finalParams.to;
        finalParams.to = temp;
      }
      finalParams.stagger = presetParams.stagger ?? finalParams.stagger ?? 0.05;
    } else if (isKeyframe && presetKey) {
      if (selectedPreset === "slide") {
        const dist = presetParams.distance ?? 300;
        const dir = presetParams.direction ?? "left";
        if (selectedMode === "in") {
          finalParams = {
            "0%": {
              x: dir === "left" ? -dist : dir === "right" ? dist : 0,
              y: dir === "top" ? -dist : dir === "bottom" ? dist : 0,
              opacity: 0,
            },
            "100%": {
              x: 0,
              y: 0,
              opacity: 1,
            },
          };
        } else {
          finalParams = {
            "0%": {
              x: 0,
              y: 0,
              opacity: 1,
            },
            "100%": {
              x: dir === "left" ? -dist : dir === "right" ? dist : 0,
              y: dir === "top" ? -dist : dir === "bottom" ? dist : 0,
              opacity: 0,
            },
          };
        }
      } else {
        finalParams = getPresetKeyframes(presetKey);
        if (selectedMode === "out" && def && def.inType === def.outType) {
          finalParams = reverseKeyframes(finalParams);
        }
      }
    } else {
      finalParams = structuredClone(keyframes);
    }

    if (!isStagger && !isMask) {
      Object.keys(finalParams).forEach((key) => {
        if (key.includes("%")) {
          finalParams[key].mirror = mirrorEnabled ? 1 : 0;
        }
      });
    }

    if (activeTab === "presets" && selectedPreset) {
      finalParams.presetId = selectedPreset;
      finalParams.metaMode = selectedMode;
    }

    return { type, options, finalParams };
  };

  const handleSave = () => {
    const { type, options, finalParams } = buildAnimationConfig();

    if (mode === "edit" && animationId) {
      clip.updateAnimation(animationId, type, options, finalParams);
    } else {
      clip.addAnimation(type, options, finalParams);
    }

    const updatedAnimations = clip.animations.map((anim: any) => ({
      id: anim.id,
      type: anim.type,
      options: anim.options,
      params: anim.params,
    }));
    core.clip.update(clipId, { animations: updatedAnimations });

    clip.emit("propsChange", {});
    setFloatingControl("");
  };

  const handleApplyToAllCaptions = () => {
    if (!studio) return;

    const { type, options, finalParams } = buildAnimationConfig();

    studio.clips.forEach((c: any) => {
      if (c.type === "Caption") {
        c.animations = [];
        const special = SPECIAL_ANIMATIONS_CAPTIONS.includes(type);
        const targetDuration = special ? c.duration : c.duration * 0.2;
        let targetDelay = options.delay;
        if (type.toLowerCase().includes("out") || selectedMode === "out") {
          targetDelay = Math.max(0, c.duration - targetDuration);
        }

        c.addAnimation(
          type,
          { ...options, duration: targetDuration, delay: targetDelay },
          finalParams,
        );
        const updatedAnimations = c.animations.map((anim: any) => ({
          id: anim.id,
          type: anim.type,
          options: anim.options,
          params: anim.params,
        }));
        core.clip.update(c.id, { animations: updatedAnimations });
        c.emit("propsChange", {});
      }
    });

    setFloatingControl("");
  };

  const sortedKeyframes = Object.keys(keyframes)
    .filter((k) => k.includes("%"))
    .sort((a, b) => {
      const aNum = parseInt(a.replace("%", ""));
      const bNum = parseInt(b.replace("%", ""));
      return aNum - bNum;
    });

  const isTextLike = typeClip === "Text" || typeClip === "Caption";

  const applicablePresets = UI_PRESETS.filter((p) => {
    if (p.category === "transition") return true;
    if (p.category === "text") return isTextLike;
    if (p.category === "combo") return typeClip === "Image" || typeClip === "Video";
    return false;
  });

  const selectedPresetDef = UI_PRESETS.find((p) => p.id === selectedPreset);

  const maskPresets = [
    "wipe",
    "circleReveal",
    "rectExpand",
    "angleWipe",
    "centerExpand",
    "blockReveal",
  ];
  const isSelectedMask = selectedPreset && maskPresets.includes(selectedPreset);
  const isSelectedStagger =
    selectedPresetDef?.category === "text" && selectedPresetDef.inType in GSAP_PRESETS;

  return (
    <Popover.Root open={!!clipId} onOpenChange={(open) => !open && setFloatingControl("")}>
      <Popover.Anchor
        className="fixed"
        style={{
          right: `${rightPanelRect.right}px`,
          top: `${rightPanelRect.top}px`,
        }}
      />
      <Popover.Content
        side="left"
        align="start"
        sideOffset={8}
        className="z-[200] w-72 border border-border bg-background p-0 shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest("[data-radix-portal]") ||
            target.closest("[data-radix-popper-content-wrapper]")
          ) {
            e.preventDefault();
          }
        }}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 py-3.5  shrink-0">
          <h3 className="text-xs font-semibold text-foreground">
            {mode === "add" ? "Add Animation" : "Edit Animation"}
          </h3>
          <button
            onClick={() => setFloatingControl("")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Tabs wrapping the header and content */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full flex flex-col flex-1 min-h-0"
        >
          {/* Fixed Tabs List */}
          <div className="px-3 py-1.5 bg-background shrink-0">
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger value="presets" className="text-[11px] py-1">
                Presets
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-[11px] py-1">
                Custom
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex flex-col gap-3 p-3">
              {activeTab === "presets" && (
                <div className="flex flex-col gap-3">
                  {!selectedPreset ? (
                    /* Preset Grid View */
                    <div className="grid grid-cols-3 gap-x-2.5 gap-y-3.5">
                      {applicablePresets.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPreset(p.id)}
                          className="flex flex-col items-center gap-1 text-center group w-full"
                        >
                          <div className="aspect-square w-full rounded-lg bg-secondary/30 border border-border/40 flex items-center justify-center relative overflow-hidden group-hover:border-primary transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <RiPlayLine className="size-4.5 text-muted-foreground/50 group-hover:text-primary group-hover:scale-115 transition-all duration-200" />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors px-0.5 truncate w-full">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Preset Details View */
                    <div className="flex flex-col gap-4">
                      {/* Back Button and Selected Preset Header */}
                      <div className="flex items-center justify-between pb-2 border-b">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPreset("")}
                          className="h-7 text-xs gap-1 px-2 -ml-2 hover:bg-secondary/20"
                        >
                          <RiArrowLeftLine className="size-3.5" />
                          Back
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {selectedPresetDef?.label}
                        </span>
                      </div>

                      {/* Mode: In / Out (Hidden for Combos) */}
                      {selectedPresetDef?.hasInOut && (
                        <div className="flex items-center justify-between py-1 border-b pb-3">
                          <span className="text-xs font-medium text-muted-foreground">Mode</span>
                          <div className="flex bg-muted p-0.5 rounded-lg border">
                            <button
                              onClick={() => setSelectedMode("in")}
                              className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                                selectedMode === "in"
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              In
                            </button>
                            <button
                              onClick={() => setSelectedMode("out")}
                              className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                                selectedMode === "out"
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              Out
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mask Preset Parameters */}
                      {isSelectedMask && (
                        <div className="grid grid-cols-1 gap-1.5 p-2 bg-secondary/20 rounded-md">
                          {selectedPreset === "wipe" && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-muted-foreground">Direction</label>
                              <Select
                                value={presetParams.wipeDirection}
                                onValueChange={(val) =>
                                  setPresetParams((prev: any) => ({
                                    ...prev,
                                    wipeDirection: val as WipeDirection,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[250]">
                                  <SelectItem value="left">Left → Right</SelectItem>
                                  <SelectItem value="right">Right → Left</SelectItem>
                                  <SelectItem value="top">Top → Bottom</SelectItem>
                                  <SelectItem value="bottom">Bottom → Top</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedPreset === "angleWipe" && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-muted-foreground">
                                Angle ({presetParams.maskAngle}°)
                              </label>
                              <Slider
                                value={[presetParams.maskAngle ?? 0]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={([val]) =>
                                  setPresetParams((prev: any) => ({ ...prev, maskAngle: val }))
                                }
                                className="flex-1"
                              />
                            </div>
                          )}

                          {selectedPreset === "centerExpand" && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-muted-foreground">Axis</label>
                              <Select
                                value={presetParams.maskAxis ?? "vertical"}
                                onValueChange={(val) =>
                                  setPresetParams((prev: any) => ({ ...prev, maskAxis: val }))
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[250]">
                                  <SelectItem value="vertical">Vertical (top + bottom)</SelectItem>
                                  <SelectItem value="horizontal">
                                    Horizontal (left + right)
                                  </SelectItem>
                                  <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {(selectedPreset === "circleReveal" ||
                            selectedPreset === "rectExpand") && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-muted-foreground">Origin</label>
                              <Select
                                value={presetParams.maskOrigin ?? "center"}
                                onValueChange={(val) =>
                                  setPresetParams((prev: any) => ({
                                    ...prev,
                                    maskOrigin: val as MaskTransform["origin"],
                                  }))
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[250]">
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="topLeft">Top Left</SelectItem>
                                  <SelectItem value="topRight">Top Right</SelectItem>
                                  <SelectItem value="bottomLeft">Bottom Left</SelectItem>
                                  <SelectItem value="bottomRight">Bottom Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedPreset === "blockReveal" && (
                            <div className="grid grid-cols-2 gap-1.5 mt-1 pt-1.5 border-t border-secondary/30">
                              <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-[10px] text-muted-foreground">
                                  Direction
                                </label>
                                <Select
                                  value={presetParams.direction ?? "right"}
                                  onValueChange={(val) =>
                                    setPresetParams((prev: any) => ({
                                      ...prev,
                                      direction: val,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[250]">
                                    <SelectItem value="left">Left → Right</SelectItem>
                                    <SelectItem value="right">Right → Left</SelectItem>
                                    <SelectItem value="top">Top → Bottom</SelectItem>
                                    <SelectItem value="bottom">Bottom → Top</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-[10px] text-muted-foreground">Mode</label>
                                <Select
                                  value={presetParams.blockRevealMode ?? "reveal"}
                                  onValueChange={(val) =>
                                    setPresetParams((prev: any) => ({
                                      ...prev,
                                      blockRevealMode: val,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[250]">
                                    <SelectItem value="reveal">
                                      Reveal (Expand & Contract)
                                    </SelectItem>
                                    <SelectItem value="slide">Slide (Fixed Width)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {presetParams.blockRevealMode === "slide" && (
                                <div className="flex flex-col gap-1 col-span-2 pb-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-muted-foreground">
                                      Block Size
                                    </label>
                                    <span className="text-[10px] text-muted-foreground">
                                      {Math.round((presetParams.blockSize ?? 0.3) * 100)}%
                                    </span>
                                  </div>
                                  <Slider
                                    value={[presetParams.blockSize ?? 0.3]}
                                    min={0.1}
                                    max={1.0}
                                    step={0.05}
                                    onValueChange={([val]) =>
                                      setPresetParams((prev: any) => ({
                                        ...prev,
                                        blockSize: val,
                                      }))
                                    }
                                  />
                                </div>
                              )}
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground">
                                  Block Color
                                </label>
                                <div className="flex gap-1.5 items-center">
                                  <input
                                    type="color"
                                    value={presetParams.blockColor ?? "#ffffff"}
                                    onChange={(e) =>
                                      setPresetParams((prev: any) => ({
                                        ...prev,
                                        blockColor: e.target.value,
                                      }))
                                    }
                                    className="w-6 h-6 rounded border cursor-pointer p-0 bg-transparent"
                                  />
                                  <span className="text-[10px] uppercase text-muted-foreground">
                                    {presetParams.blockColor ?? "#ffffff"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground">
                                  Inverted Text
                                </label>
                                <div className="flex gap-1.5 items-center">
                                  <input
                                    type="color"
                                    value={presetParams.textColorInside ?? "#000000"}
                                    onChange={(e) =>
                                      setPresetParams((prev: any) => ({
                                        ...prev,
                                        textColorInside: e.target.value,
                                      }))
                                    }
                                    className="w-6 h-6 rounded border cursor-pointer p-0 bg-transparent"
                                  />
                                  <span className="text-[10px] uppercase text-muted-foreground">
                                    {presetParams.textColorInside ?? "#000000"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedPreset !== "blockReveal" && (
                            <div className="flex items-center gap-2 mt-1">
                              <label className="text-[10px] text-muted-foreground shrink-0 w-20">
                                Initial {Math.round((presetParams.maskInitialProgress ?? 0) * 100)}%
                              </label>
                              <Slider
                                value={[presetParams.maskInitialProgress ?? 0]}
                                min={0}
                                max={0.9}
                                step={0.01}
                                onValueChange={([val]) =>
                                  setPresetParams((prev: any) => ({
                                    ...prev,
                                    maskInitialProgress: val,
                                  }))
                                }
                                className="flex-1"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Slide Preset Specific Options (Transition or Text) */}
                      {(selectedPreset === "slide" ||
                        selectedPreset === "slideCaption" ||
                        selectedPreset === "slideByWord" ||
                        selectedPreset === "slideMaskWord") && (
                        <div className="grid grid-cols-2 gap-1.5 p-2 bg-secondary/20 rounded-md">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">Direction</label>
                            <Select
                              value={presetParams.direction}
                              onValueChange={(val) =>
                                setPresetParams((prev: any) => ({
                                  ...prev,
                                  direction: val,
                                }))
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[250]">
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(selectedPreset === "slide" ||
                            selectedPreset === "slideByWord" ||
                            selectedPreset === "slideMaskWord") && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-muted-foreground">
                                Distance (px)
                              </label>
                              <NumberInput
                                value={presetParams.distance}
                                onChange={(val) =>
                                  setPresetParams((prev: any) => ({
                                    ...prev,
                                    distance: val,
                                  }))
                                }
                                className="h-7 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stagger Preset Specific Options */}
                      {isSelectedStagger && (
                        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-md">
                          <label className="text-[10px] text-muted-foreground shrink-0 w-14">
                            Stagger {presetParams.stagger}s
                          </label>
                          <Slider
                            value={[presetParams.stagger || 0.05]}
                            min={0}
                            max={1.5}
                            step={0.01}
                            onValueChange={([val]) =>
                              setPresetParams((prev: any) => ({ ...prev, stagger: val }))
                            }
                            className="flex-1"
                          />
                        </div>
                      )}

                      {/* Timings */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold">Timing</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground">Duration (ms)</span>
                            <NumberInput value={duration} onChange={setDuration} className="h-8" />
                          </div>
                          <div
                            className={cn(
                              "flex flex-col gap-1",
                              selectedMode === "out" &&
                                selectedPresetDef?.category !== "combo" &&
                                "opacity-50 pointer-events-none",
                            )}
                          >
                            <span className="text-[10px] text-muted-foreground">Delay (ms)</span>
                            <NumberInput value={delay} onChange={setDelay} className="h-8" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground">Iterations</span>
                            <NumberInput
                              value={iterCount}
                              onChange={setIterCount}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Easing */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold">Easing</label>
                        <EasingOptions easing={easing} setEasing={setEasing} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "custom" && (
                <div className="flex flex-col gap-4">
                  {/* Keyframe Stop List */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold">Keyframes</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddKeyframe}
                        className="h-7 gap-1 text-xs"
                      >
                        <RiAddLine className="size-3" />
                        Add Stop
                      </Button>
                    </div>
                    {sortedKeyframes.map((keyframe) => (
                      <KeyframeItem
                        key={keyframe}
                        keyframe={keyframe}
                        properties={keyframes[keyframe] || {}}
                        onPropertyChange={(prop, val) => handlePropertyChange(keyframe, prop, val)}
                        onPropertyToggle={(prop, enabled) =>
                          handlePropertyToggle(keyframe, prop, enabled)
                        }
                        onRemove={() => handleRemoveKeyframe(keyframe)}
                        onRename={(newKey) => handleRenameKeyframe(keyframe, newKey)}
                        canRemove={keyframe !== "0%" && keyframe !== "100%"}
                      />
                    ))}
                  </div>

                  {/* Mirror */}
                  {typeClip !== "Text" && (
                    <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/20 rounded-md">
                      <span className="text-[10px] text-muted-foreground">Mirror</span>
                      <Switch checked={mirrorEnabled} onCheckedChange={setMirrorEnabled} />
                    </div>
                  )}

                  {/* Timings */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold">Timing</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">Duration (ms)</span>
                        <NumberInput value={duration} onChange={setDuration} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">Delay (ms)</span>
                        <NumberInput value={delay} onChange={setDelay} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">Iterations</span>
                        <NumberInput value={iterCount} onChange={setIterCount} className="h-8" />
                      </div>
                    </div>
                  </div>

                  {/* Easing */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Easing</label>
                    <EasingOptions easing={easing} setEasing={setEasing} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>

        {/* Fixed Bottom Actions */}
        {(activeTab === "custom" || (activeTab === "presets" && !!selectedPreset)) && (
          <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-border bg-muted/50 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setFloatingControl("")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              onClick={typeClip === "Caption" ? handleApplyToAllCaptions : handleSave}
              disabled={
                activeTab === "presets"
                  ? !selectedPreset
                  : !Object.values(keyframes).some((frame) => Object.keys(frame).length > 0)
              }
            >
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </div>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}

interface KeyframeItemProps {
  keyframe: string;
  properties: Partial<AnimationProps>;
  onPropertyChange: (property: PropertyKey, value: number) => void;
  onPropertyToggle: (property: PropertyKey, enabled: boolean) => void;
  onRemove: () => void;
  onRename: (newKey: string) => void;
  canRemove: boolean;
}

function KeyframeItem({
  keyframe,
  properties,
  onPropertyChange,
  onPropertyToggle,
  onRemove,
  onRename,
  canRemove,
}: KeyframeItemProps) {
  const [pctValue, setPctValue] = useState(keyframe.replace("%", ""));

  useEffect(() => {
    setPctValue(keyframe.replace("%", ""));
  }, [keyframe]);

  const activeProps = (Object.keys(properties) as PropertyKey[]).filter(
    (p) => p !== "mirror" && p in ANIMATABLE_PROPERTIES,
  );
  const availableProps = (Object.keys(ANIMATABLE_PROPERTIES) as PropertyKey[]).filter(
    (p) => p !== "mirror" && !(p in properties),
  );

  const commitRename = (raw: string) => {
    const n = Math.max(1, Math.min(99, parseInt(raw) || 1));
    setPctValue(String(n));
    const newKey = `${n}%`;
    if (newKey !== keyframe) onRename(newKey);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b">
        {canRemove ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={99}
              value={pctValue}
              onChange={(e) => setPctValue(e.target.value)}
              onBlur={(e) => commitRename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename((e.target as HTMLInputElement).value);
                if (e.key === "Escape") setPctValue(keyframe.replace("%", ""));
              }}
              className="w-12 h-7 rounded border bg-background px-2 text-sm font-bold tabular-nums text-center outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-sm font-bold text-muted-foreground">%</span>
          </div>
        ) : (
          <span className="text-sm font-bold tabular-nums">{keyframe}</span>
        )}
        <span className="text-xs text-muted-foreground flex-1">
          {activeProps.length === 0
            ? "No properties"
            : activeProps.map((p) => ANIMATABLE_PROPERTIES[p].label).join(", ")}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
            <RiDeleteBinLine className="size-3.5" />
          </button>
        )}
      </div>

      {/* Property rows */}
      <div className="p-3 flex flex-col gap-3 bg-card">
        {activeProps.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-1">
            No properties — add one below
          </p>
        )}
        {activeProps.map((prop) => {
          const config = ANIMATABLE_PROPERTIES[prop];
          return (
            <div key={prop} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{config.label}</span>
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={properties[prop] ?? config.default}
                    onChange={(val) => onPropertyChange(prop, val)}
                    className="w-16 h-7 text-xs"
                  />
                  <button
                    onClick={() => onPropertyToggle(prop, false)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <RiCloseLine className="size-3.5" />
                  </button>
                </div>
              </div>
              <Slider
                value={[properties[prop] ?? config.default]}
                onValueChange={([val]) => onPropertyChange(prop, val)}
                min={config.min}
                max={config.max}
                step={config.step}
              />
            </div>
          );
        })}

        {availableProps.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed text-muted-foreground"
              >
                <RiAddLine data-icon="inline-start" />
                Add Property
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[300]" align="start">
              {availableProps.map((p) => (
                <DropdownMenuItem key={p} onSelect={() => onPropertyToggle(p, true)}>
                  {ANIMATABLE_PROPERTIES[p].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

const EasingOptions = ({
  easing,
  setEasing,
}: {
  easing: string;
  setEasing: (easing: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Select value={easing} onValueChange={setEasing}>
        <SelectTrigger className="w-full h-7 text-xs">
          <SelectValue placeholder="Easing" />
        </SelectTrigger>
        <SelectContent className="z-[250]">
          <SelectItem value="linear">Linear</SelectItem>
          <SelectItem value="slow">Slow</SelectItem>
          <SelectItem value="easeInQuad">Ease In Quad</SelectItem>
          <SelectItem value="easeOutQuad">Ease Out Quad</SelectItem>
          <SelectItem value="easeInOutQuad">Ease In Out Quad</SelectItem>
          <SelectItem value="easeInCubic">Ease In Cubic</SelectItem>
          <SelectItem value="easeOutCubic">Ease Out Cubic</SelectItem>
          <SelectItem value="easeInOutCubic">Ease In Out Cubic</SelectItem>
          <SelectItem value="easeInBack">Ease In Back</SelectItem>
          <SelectItem value="easeOutBack">Ease Out Back</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
