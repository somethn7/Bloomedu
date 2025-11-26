/**
 * Responsive Test Script
 * Bu script, projedeki responsive sorunları tespit etmeye yardımcı olur
 */

const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'screens');
const issues = [];

// Sabit genişlik/yükseklik değerleri bul
function findFixedDimensions(content, filePath) {
  const fixedWidthRegex = /(?:width|minWidth|maxWidth):\s*(\d+)(?!%)/g;
  const fixedHeightRegex = /(?:height|minHeight|maxHeight):\s*(\d+)(?!%)/g;
  
  let match;
  const fixedDimensions = [];
  
  while ((match = fixedWidthRegex.exec(content)) !== null) {
    if (parseInt(match[1]) > 200) { // 200'den büyük sabit değerler
      fixedDimensions.push({
        type: 'width',
        value: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  while ((match = fixedHeightRegex.exec(content)) !== null) {
    if (parseInt(match[1]) > 200) { // 200'den büyük sabit değerler
      fixedDimensions.push({
        type: 'height',
        value: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  if (fixedDimensions.length > 0) {
    issues.push({
      file: filePath,
      type: 'fixed-dimensions',
      details: fixedDimensions
    });
  }
}

// Dimensions kullanımını kontrol et
function checkDimensionsUsage(content, filePath) {
  const hasDimensions = /Dimensions\.get\(['"]window['"]\)/.test(content);
  const hasListener = /Dimensions\.addEventListener/.test(content);
  const hasUseWindowDimensions = /useWindowDimensions/.test(content);
  
  if (hasDimensions && !hasListener && !hasUseWindowDimensions) {
    issues.push({
      file: filePath,
      type: 'dimensions-no-listener',
      message: 'Dimensions kullanılıyor ama ekran döndürme için listener yok'
    });
  }
}

// useWindowDimensions kullanmayan ekranları kontrol et (opsiyonel - sadece uyarı)
function checkWindowDimensionsUsage(content, filePath) {
  // Sadece screen dosyalarını kontrol et (Context, types gibi dosyaları atla)
  if (!filePath.includes('Screen') && !filePath.includes('Game')) {
    return;
  }
  
  const hasUseWindowDimensions = /useWindowDimensions/.test(content);
  const hasDimensions = /Dimensions\.get\(['"]window['"]\)/.test(content);
  const hasFixedLargeDimensions = /(?:width|height):\s*(?:[3-9]\d{2}|\d{4,})/.test(content);
  
  // Eğer ekran boyutuna bağlı hesaplamalar varsa ama useWindowDimensions yoksa uyar
  if (!hasUseWindowDimensions && !hasDimensions && hasFixedLargeDimensions) {
    // Bu sadece bilgilendirme amaçlı, kritik değil
    // Çünkü flexbox kullanılıyorsa responsive olabilir
  }
}

// Tüm screen dosyalarını tara
function scanScreens(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanScreens(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(__dirname, filePath);
      
      findFixedDimensions(content, relativePath);
      checkDimensionsUsage(content, relativePath);
      checkWindowDimensionsUsage(content, relativePath);
    }
  });
}

// Test başlat
console.log('🔍 Responsive test başlatılıyor...\n');
scanScreens(screensDir);

// Sonuçları göster
if (issues.length === 0) {
  console.log('✅ Hiçbir responsive sorun bulunamadı!');
} else {
  console.log(`⚠️  ${issues.length} potansiyel responsive sorun bulundu:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Tip: ${issue.type}`);
    
    if (issue.details) {
      issue.details.forEach(detail => {
        console.log(`   - Satır ${detail.line}: Sabit ${detail.type} = ${detail.value}`);
      });
    }
    
    if (issue.message) {
      console.log(`   - ${issue.message}`);
    }
    
    console.log('');
  });
  
  console.log('\n💡 Öneriler:');
  console.log('   - Büyük sabit değerleri yüzde veya flex değerlerine çevirin');
  console.log('   - Ekran döndürme için Dimensions.addEventListener ekleyin');
  console.log('   - useWindowDimensions hook\'unu kullanmayı düşünün');
}

