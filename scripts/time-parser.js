#!/usr/bin/env node
/**
 * 时间解析器 - 支持自然语言时间输入
 */

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isBetween from "dayjs/plugin/isBetween.js";
import weekday from "dayjs/plugin/weekday.js";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(weekday);

/**
 * 解析自然语言时间描述
 * @param {string} timeStr 时间描述
 * @param {Object} options 解析选项
 * @returns {Object} 解析结果
 */
function parseNaturalLanguageTime(timeStr, options = {}) {
  console.log("⏰ 解析自然语言时间:", timeStr);
  
  const result = {
    success: false,
    message: "",
    startTime: null,
    endTime: null
  };

  // 预处理输入
  const normalizedTimeStr = timeStr.trim().toLowerCase();
  
  // 常见时间模式匹配
  const patterns = [
    {
      name: "精确时间",
      regex: /(\d{4}|\d{2})[-.\/]?(\d{1,2})[-.\/]?(\d{1,2})?[T\s]?(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/g,
      handler: matchPreciseTime
    },
    {
      name: "相对时间",
      regex: /(明天|今天|后天|大后天|昨天|前天)[^\d]*(\d{1,2})?:?(\d{1,2})?/,
      handler: matchRelativeTime
    },
    {
      name: "星期几",
      regex: /(下|上)?(周一|星期二|周三|周四|星期五|周六|周日|礼拜一|礼拜二|礼拜三|礼拜四|礼拜五|礼拜六|礼拜日|周1|周2|周3|周4|周5|周6|周7)/,
      handler: matchWeekdayTime
    }
  ];

  for (const pattern of patterns) {
    const matches = normalizedTimeStr.match(pattern.regex);
    if (matches) {
      console.log(`🔍 匹配到模式: ${pattern.name}`);
      const parseResult = pattern.handler(matches, normalizedTimeStr);
      if (parseResult.success) {
        Object.assign(result, parseResult);
        break;
      }
    }
  }

  if (!result.success) {
    result.message = "无法解析时间格式，请使用标准时间格式（如：2026-02-22 15:30）";
  }

  return result;
}

/**
 * 解析精确时间
 * @param {Array} matches 匹配结果
 * @param {string} timeStr 时间字符串
 * @returns {Object} 解析结果
 */
function matchPreciseTime(matches, timeStr) {
  // 简单实现，需要更复杂的解析
  const now = dayjs();
  const defaultDuration = 60 * 60 * 1000; // 默认1小时
  
  try {
    // 尝试解析为完整时间戳
    const startTime = dayjs(matches[0]);
    if (startTime.isValid()) {
      const endTime = startTime.add(defaultDuration, "milliseconds");
      return {
        success: true,
        message: "精确时间解析成功",
        startTime: startTime.toDate(),
        endTime: endTime.toDate()
      };
    }
  } catch (error) {
    console.error("精确时间解析失败:", error);
  }
  
  return { success: false, message: "精确时间解析失败" };
}

/**
 * 解析相对时间
 * @param {Array} matches 匹配结果
 * @param {string} timeStr 时间字符串
 * @returns {Object} 解析结果
 */
function matchRelativeTime(matches, timeStr) {
  const now = dayjs();
  const dayMap = {
    "今天": 0,
    "明天": 1,
    "后天": 2,
    "大后天": 3,
    "昨天": -1,
    "前天": -2
  };
  
  try {
    // 计算日期
    const dayOffset = dayMap[matches[1]];
    let targetDate = now.add(dayOffset, "day").hour(0).minute(0).second(0).millisecond(0);
    
    // 解析时间
    let hour = 0;
    let minute = 0;
    
    if (matches[2]) {
      hour = parseInt(matches[2]);
    }
    
    if (matches[3]) {
      minute = parseInt(matches[3]);
    }
    
    targetDate = targetDate.hour(hour).minute(minute);
    
    return {
      success: true,
      message: "相对时间解析成功",
      startTime: targetDate.toDate(),
      endTime: targetDate.add(1, "hour").toDate() // 默认1小时
    };
  } catch (error) {
    console.error("相对时间解析失败:", error);
    return { success: false, message: "相对时间解析失败" };
  }
}

/**
 * 解析星期几时间
 * @param {Array} matches 匹配结果
 * @param {string} timeStr 时间字符串
 * @returns {Object} 解析结果
 */
function matchWeekdayTime(matches, timeStr) {
  const now = dayjs();
  const weekDayMap = {
    "周一": 1, "周1": 1, "礼拜一": 1,
    "周二": 2, "周2": 2, "礼拜二": 2,
    "周三": 3, "周3": 3, "礼拜三": 3,
    "周四": 4, "周4": 4, "礼拜四": 4,
    "周五": 5, "周5": 5, "礼拜五": 5,
    "周六": 6, "周6": 6, "礼拜六": 6,
    "周日": 0, "周7": 0, "礼拜日": 0
  };
  
  try {
    const weekOffset = matches[1] === "下" ? 1 : matches[1] === "上" ? -1 : 0;
    const targetWeekDay = weekDayMap[matches[2]];
    
    // 计算目标日期
    let targetDate = now;
    while (targetDate.weekday() !== targetWeekDay) {
      targetDate = weekOffset > 0 ? targetDate.add(1, "day") : 
                   weekOffset < 0 ? targetDate.subtract(1, "day") : 
                   targetDate.add(1, "day");
    }
    
    return {
      success: true,
      message: "星期几时间解析成功",
      startTime: targetDate.hour(10).minute(0).toDate(),
      endTime: targetDate.hour(11).minute(0).toDate()
    };
  } catch (error) {
    console.error("星期几时间解析失败:", error);
    return { success: false, message: "星期几时间解析失败" };
  }
}

/**
 * 解析时间段
 * @param {string} timeStr 时间段字符串
 * @returns {Object} 解析结果
 */
function parseTimeRange(timeStr) {
  // 简单的时间段解析
  const rangePattern = /(\d+:\d+)\s*[到-]\s*(\d+:\d+)/;
  const match = timeStr.match(rangePattern);
  
  if (match) {
    const start = dayjs(match[1]);
    const end = dayjs(match[2]);
    
    if (start.isValid() && end.isValid() && end.isAfter(start)) {
      return {
        success: true,
        message: "时间段解析成功",
        startTime: start.toDate(),
        endTime: end.toDate()
      };
    }
  }
  
  return null;
}

/**
 * 计算默认时间
 * @param {Date} startTime 开始时间
 * @returns {Date} 结束时间
 */
function getDefaultEndTime(startTime) {
  return new Date(startTime.getTime() + 60 * 60 * 1000); // 默认1小时
}

export {
  parseNaturalLanguageTime,
  parseTimeRange,
  getDefaultEndTime
};