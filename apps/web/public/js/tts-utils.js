/**
 * TTS (Text-to-Speech) 유틸리티
 * Web Speech API를 활용한 음성 읽어주기 기능
 */

class TTSManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
    
    // 음성 목록 로드
    this.loadVoices();
    
    // 음성 목록 변경 이벤트 (일부 브라우저에서 필요)
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }
  
  /**
   * 사용 가능한 음성 목록 로드
   */
  loadVoices() {
    this.voices = this.synth.getVoices();
    this.isInitialized = this.voices.length > 0;
    
    // 한국어 음성 우선순위 설정
    this.koreanVoice = this.voices.find(voice => 
      voice.lang.startsWith('ko') || voice.lang === 'ko-KR'
    );
    
    console.log('TTS 초기화:', {
      totalVoices: this.voices.length,
      koreanVoice: this.koreanVoice?.name || 'none',
      allVoices: this.voices.map(v => ({ name: v.name, lang: v.lang }))
    });
  }
  
  /**
   * 텍스트를 음성으로 읽어주기
   * @param {string} text - 읽을 텍스트
   * @param {Object} options - 음성 옵션
   */
  speak(text, options = {}) {
    // 진행 중인 음성 중지
    this.stop();
    
    if (!text || text.trim().length === 0) {
      console.warn('TTS: 읽을 텍스트가 없습니다.');
      return;
    }
    
    // SpeechSynthesisUtterance 생성
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // 음성 설정
    if (this.koreanVoice) {
      this.currentUtterance.voice = this.koreanVoice;
    }
    
    // 옵션 적용
    this.currentUtterance.lang = options.lang || 'ko-KR';
    this.currentUtterance.rate = options.rate || 1.0; // 속도 (0.1 ~ 10)
    this.currentUtterance.pitch = options.pitch || 1.0; // 음높이 (0 ~ 2)
    this.currentUtterance.volume = options.volume || 1.0; // 볼륨 (0 ~ 1)
    
    // 이벤트 핸들러
    this.currentUtterance.onstart = () => {
      console.log('TTS 시작:', text.substring(0, 50));
      if (options.onStart) options.onStart();
    };
    
    this.currentUtterance.onend = () => {
      console.log('TTS 종료');
      if (options.onEnd) options.onEnd();
    };
    
    this.currentUtterance.onerror = (event) => {
      console.error('TTS 오류:', event);
      if (options.onError) options.onError(event);
    };
    
    // 음성 재생
    this.synth.speak(this.currentUtterance);
  }
  
  /**
   * 음성 일시정지
   */
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }
  
  /**
   * 음성 재개
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }
  
  /**
   * 음성 중지
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }
  
  /**
   * 현재 재생 중인지 확인
   */
  isSpeaking() {
    return this.synth.speaking;
  }
  
  /**
   * 일시정지 상태인지 확인
   */
  isPaused() {
    return this.synth.paused;
  }
  
  /**
   * 브라우저 지원 여부 확인
   */
  static isSupported() {
    return 'speechSynthesis' in window;
  }
}

// 전역 TTS 매니저 인스턴스
let ttsManager = null;

/**
 * TTS 매니저 인스턴스 가져오기 (Singleton)
 */
function getTTSManager() {
  if (!TTSManager.isSupported()) {
    console.warn('이 브라우저는 Web Speech API를 지원하지 않습니다.');
    return null;
  }
  
  if (!ttsManager) {
    ttsManager = new TTSManager();
  }
  
  return ttsManager;
}

/**
 * HTML 요소에 TTS 버튼 추가
 * @param {string} elementId - 대상 요소 ID
 * @param {string} textSelector - 읽을 텍스트를 포함한 요소 선택자
 * @param {Object} options - TTS 옵션
 */
function addTTSButton(elementId, textSelector, options = {}) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('TTS: 요소를 찾을 수 없습니다:', elementId);
    return;
  }
  
  // 이미 버튼이 있으면 제거
  const existingBtn = element.querySelector('.tts-button');
  if (existingBtn) existingBtn.remove();
  
  // TTS 버튼 생성
  const button = document.createElement('button');
  button.className = 'tts-button btn btn-sm btn-outline-primary';
  button.innerHTML = '<i class="fas fa-volume-up"></i> 읽어주기';
  button.type = 'button';
  
  button.onclick = function() {
    const manager = getTTSManager();
    if (!manager) {
      alert('음성 읽어주기 기능을 지원하지 않는 브라우저입니다.');
      return;
    }
    
    // 읽을 텍스트 가져오기
    let text = '';
    if (textSelector) {
      const textElement = document.querySelector(textSelector);
      text = textElement ? textElement.textContent : '';
    } else {
      text = element.textContent;
    }
    
    if (!text || text.trim().length === 0) {
      alert('읽을 내용이 없습니다.');
      return;
    }
    
    // 이미 재생 중이면 중지
    if (manager.isSpeaking()) {
      manager.stop();
      button.innerHTML = '<i class="fas fa-volume-up"></i> 읽어주기';
      button.classList.remove('btn-danger');
      button.classList.add('btn-outline-primary');
      return;
    }
    
    // 음성 재생
    manager.speak(text, {
      ...options,
      onStart: () => {
        button.innerHTML = '<i class="fas fa-stop"></i> 중지';
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-danger');
        if (options.onStart) options.onStart();
      },
      onEnd: () => {
        button.innerHTML = '<i class="fas fa-volume-up"></i> 읽어주기';
        button.classList.remove('btn-danger');
        button.classList.add('btn-outline-primary');
        if (options.onEnd) options.onEnd();
      }
    });
  };
  
  element.appendChild(button);
}

/**
 * 여러 요소에 TTS 버튼 일괄 추가
 * @param {string} selector - 요소 선택자 (예: '.announcement-item')
 * @param {Function} getTextFn - 텍스트 추출 함수
 */
function addTTSButtons(selector, getTextFn) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element, index) => {
    // 이미 버튼이 있으면 스킵
    if (element.querySelector('.tts-button')) return;
    
    const button = document.createElement('button');
    button.className = 'tts-button btn btn-sm btn-outline-primary ms-2';
    button.innerHTML = '<i class="fas fa-volume-up"></i>';
    button.type = 'button';
    button.title = '읽어주기';
    
    button.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const manager = getTTSManager();
      if (!manager) {
        alert('음성 읽어주기 기능을 지원하지 않는 브라우저입니다.');
        return;
      }
      
      // 텍스트 추출
      const text = getTextFn ? getTextFn(element) : element.textContent;
      
      if (!text || text.trim().length === 0) {
        alert('읽을 내용이 없습니다.');
        return;
      }
      
      // 이미 재생 중이면 중지
      if (manager.isSpeaking()) {
        manager.stop();
        // 모든 버튼 초기화
        document.querySelectorAll('.tts-button').forEach(btn => {
          btn.innerHTML = '<i class="fas fa-volume-up"></i>';
          btn.classList.remove('btn-danger');
          btn.classList.add('btn-outline-primary');
        });
        return;
      }
      
      // 음성 재생
      manager.speak(text, {
        onStart: () => {
          button.innerHTML = '<i class="fas fa-stop"></i>';
          button.classList.remove('btn-outline-primary');
          button.classList.add('btn-danger');
        },
        onEnd: () => {
          button.innerHTML = '<i class="fas fa-volume-up"></i>';
          button.classList.remove('btn-danger');
          button.classList.add('btn-outline-primary');
        }
      });
    };
    
    // 버튼 삽입 위치 찾기
    const titleElement = element.querySelector('.card-title, h5, h6, .title');
    if (titleElement) {
      titleElement.appendChild(button);
    } else {
      element.appendChild(button);
    }
  });
}

// 전역으로 내보내기
window.TTSManager = TTSManager;
window.getTTSManager = getTTSManager;
window.addTTSButton = addTTSButton;
window.addTTSButtons = addTTSButtons;
