#!/usr/bin/env node

const path = require('path');
const { calculateRelativeFontSize } = require('./lib/watermark');

console.log('🧪 开始测试相对字体大小计算...\n');

// 测试不同分辨率的字体大小计算
const testCases = [
  { width: 640, height: 480, name: '标清 (640x480)' },
  { width: 1280, height: 720, name: '高清 (1280x720)' },
  { width: 1920, height: 1080, name: '全高清 (1920x1080)' },
  { width: 2560, height: 1440, name: '2K (2560x1440)' },
  { width: 3840, height: 2160, name: '4K (3840x2160)' },
  { width: 7680, height: 4320, name: '8K (7680x4320)' }
];

console.log('分辨率测试结果:');
console.log('═'.repeat(50));

testCases.forEach(testCase => {
  const fontSize = calculateRelativeFontSize(testCase.width, testCase.height);
  const scaleFactor = (Math.min(testCase.width, testCase.height) / 1920).toFixed(2);
  
  console.log(`${testCase.name.padEnd(20)} | 字体: ${fontSize.toString().padStart(2)}px | 缩放: ${scaleFactor}x`);
});

console.log('═'.repeat(50));

// 测试边界条件
console.log('\n🔍 边界条件测试:');
const edgeCases = [
  { width: 100, height: 100, name: '极小图片' },
  { width: 10000, height: 10000, name: '极大图片' }
];

edgeCases.forEach(testCase => {
  const fontSize = calculateRelativeFontSize(testCase.width, testCase.height);
  console.log(`${testCase.name.padEnd(15)} (${testCase.width}x${testCase.height}) | 字体: ${fontSize}px`);
});

console.log('\n✅ 所有测试完成！');
console.log('\n💡 提示: 运行 "node bin/watermark.js --help" 查看CLI用法');
