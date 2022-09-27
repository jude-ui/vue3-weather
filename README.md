# Vue3 템플릿 with Webpack

## Installation

```bash
# Default.
$ npx degit jude-ui/vue3-webpack-template <Project Name>

# Start!
$ cd <Project Name>
$ npm i
$ npm run dev
```

## Specs

- Vue3
- Webpack
- SCSS
- Babel
- PostCSS
- Autoprefixer
- ESLint
- axios
- Lodash

## Packages

__webpack__: 모듈(패키지) 번들러의 핵심 패키지<br>
__webpack-cli__: 터미널에서 Webpack 명령(CLI)을 사용할 수 있음<br>
__webpack-dev-server__: 개발용으로 Live Server를 실행(HMR)<br>

__html-webpack-plugin__: 최초 실행될 HTML 파일(템플릿)을 연결<br>
__copy-webpack-plugin__: 정적 파일(파비콘, 이미지 등)을 제품(`dist`) 폴더로 복사<br>

__sass-loader__: SCSS(Sass) 파일을 로드<br>
__postcss-loader__: PostCSS(Autoprefixer)로 스타일 파일을 처리<br>
__css-loader__: CSS 파일을 로드<br>
__style-loader__: 로드된 스타일(CSS)을 `<style>`로 `<head>`에 삽입<br>
__babel-loader__: JS 파일을 로드<br>
__vue-loader__: Vue 파일을 로드<br>
__vue-style-loader__: Vue 파일의 로드된 스타일(CSS)을 `<style>`로 `<head>`에 삽입<br>
__file-loader__: 지정된 파일(이미지)을 로드<br>

__@babel/core__: ES6 이상의 코드를 ES5 이하 버전으로 변환<br>
__@babel/preset-env__: Babel 지원 스펙을 지정<br>
__@babel/plugin-transform-runtime__: Async/Await 문법 지원<br>

__sass__: SCSS(Sass) 문법을 해석(스타일 전처리기)<br>
__postcss__: Autoprefixer 등의 다양한 스타일 후처리기 패키지<br>
__autoprefixer__: 스타일에 자동으로 공급 업체 접두사(Vendor prefix)를 적용하는 PostCSS의 플러그인<br>

__vue__: Vue.js 프레임워크<br>
__@vue/compiler-sfc__: .vue 파일(SFC, 3버전)을 해석<br>
__vuex__: Vue의 중앙 집중식 데이터 저장소 기능<br>

__axios__: HTTP 클라이언트 라이브러리로 기상청 데이터를 요청하기 위해 사용<br>

__lodash__: 다양한 유틸리티 기능을 제공하는 자바스크립트 라이브러리<br>

__eslint__: 정적 코드 분석 도구 __(+ESLint)__<br>
__eslint-plugin-vue__: Vue.js 코드 분석 __(+ESLint)__<br>
__babel-eslint__: ES6 이상의 코드(Babel)를 분석 __(+ESLint)__<br>

## 주의사항!

- `webpack-dev-server`와 `webpack-cli`는 메이저 버전을 일치 시켜야 함!<br>
- `@vue/compiler-sfc`와 `vue`버전을 일치 시켜야 정상 작동을 보장함<br>
- `package.json` 옵션으로 `browserslist` 추가!<br>
- `.postcssrc.js` PostCSS 구성 옵션<br>
- `.babelrc.js` Babel 구성 옵션<br>
- `.eslintrc.js` ESLint 구성 옵션<br>

## ESLint Auto fix on save for VSCode

- 모든 명령 표시(Windows: `Ctrl`+`Shift`+`P` / macOS: `Cmd`+`Shift`+`P`)
- 모든 명령 표시에서 `settings` 검색
- `Preferences: Open Settings (JSON)` 선택
- 오픈된 `settings.json`파일에서 아래 코드 추가 및 저장

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 작업과정

- 날씨 앱 만들기 위해 공공 데이터 포털에서 기상청 단기예보 데이터 활용신청을 하여 인증키를 받음
- 초단기 예보의 데이터 카테고리 종류는 총 10개인데 6개씩(향후 6시간 데이터) 총 60개가 내려오고 있었고 배열 데이터 하나당 카테고리가 하나씩 들어 있어서 화면에 뿌려서 쓰기 힘든 구조.
  - 운량 데이터 1,2,3,4,5,6시, 기온 데이터 1,2,3,4,5,6시, 풍향 데이터 1,2,3,4,5,6시 ... 이런 순서로 데이터가 내려오는 식
  1. 빈 객체를 생성
  2. forEach로 배열 데이터를 순회
  3. 빈 객체에 원하는 데이터 구조로 데이터 할당
  4. 각 데이터의 시간을 키값으로 데이터를 재구성(Object.assign 활용)
  5. 결과물 객체의 value 값만으로 구성된 배열을 얻기 위해 Object.values 활용
  6. 24시각을 기준으로 정렬이 되어 데이터 순서가 바뀌는 __`이슈`__ 발생
    - lodash의 sortBy 메소드를 활용하여 index 기준으로 데이터 정렬하여 __`처리`__
- 초단기 예보는 30분 단위로 예보가 발표되는데 에를들면 현재 15:20분이면 14:30분 발표된 예보를 사용하게 된다.
  - 14:30분에 예보가 발표되면 15,16,17,18,19,20 시의 데이터가 내려옴
    - 15시부터 15:30분까지는 불필요한 15시 예보 데이터가 내려오는 __`이슈`__ 발생
      - 때문에 0~30분에 대한 분기처리를 하여 shift() 메서드로 첫번째 데이터 제거하여 __`처리`__
- 기상청에서 제공해주는 단기예보 조회서비스 활용가이드 문서를 참고하여 데이터로 내려오는 코드값들을 알맞은 단어로 치환하는 작업 진행 (ex. 하늘상태 코드값 1(맑음), 3(구름많음), 4(흐림))
  - store의 getters로 작업할까 생각도 해봤지만 그렇게 되면 치환 시킨 데이터 종류별로 별도 배열이 생성되기 때문에 화면에 렌더링 시킬 때 불편함
    - 따라서 mutations에 각각 치환하는 데이터별로 함수를 만들고 최초 데이터를 가져올 때 commit으로 함수들을 호출하여 치환된 단어들로 데이터 업데이트
- 데이터 중에 하늘상태인 SKY 값이 흐림이고 강수형태인 PTY 값이 비로 같이 내려오는 경우가 있어서 기상청에 문의를 해봤고, SKY 값은 오직 운량에 따른 값이라는 답변을 받음
  - 즉, PTY 값이 빗방울이나 비일 경우 SKY 값이 내려오더라도 표현할 날씨 값에는 제외 시킬 필요가 있어서 분기처리
- state에 date 라는 상태값에 오늘의 날짜 데이터를 생성하면 편리할거 같아서 생성
  - 년월일시분초 등의 데이터를 하나의 객체로 만들기 위해 mutations에 createDateGroup 함수를 생성
    - 코어 메소드인 Date() 객체를 활용
- 기상청 데이터를 요청시 날짜나 시간 데이터의 숫자 앞에 0이 들어가야해서 0을 붙여주는 zeroPlus 라는 함수를 createDateGroup 함수 안에 내장 함수로 생성
  - 초단기 예보 발표 시각은 매 시각 30분마다 있는데 이걸 데이터 요청할 때 같이 넣어보내야 해서, 이 값을 스크립트로 계산해서 동기화 시켜주는 기능이 필요하다.
    - 이 값 역시 zeroPlus 함수 기능이 필요하여 내장 함수가 아닌 store 상태값으로 전역적으로 사용하고 싶어서 고민함
      - 하지만 mutations의 함수 들은 같은 mutations 함수 호출은 불가능
        - state에 단순 값이 아닌 함수 형태로 작성해보니 잘 작동해서 원하는 방식으로 store 내부 및 컴포넌트에서 공통처리된 기능을 사용할 수 있게 됨
- 기상청에선 지역마다 좌표값을 api가 아닌 엑셀파일로 제공해 주기 때문에 시/도 > 구/군 > 읍/면/동 데이터들을 직접 배열 및 객체 형태로 store에 입력해서 데이터를 활용함

----
- 현재 날씨 데이터 추가 작업
- 현재 날씨 데이터가 가끔식 01번 애플리케이션 에러가 떠서 기상청에 문의하니 40분부터 해당시간으로 api를 요청해야 한다는 답변을 받고 baseTime 계산하는 함수 수정
- 00시일 때 초단기 실황과 초단기 예보의 api 내려받는 시각이 각각 30분과 40분이기 때문에 이전날의 데이터를 호출해야 해서 api 요청시 today 를 계산해주는 기능이 필요
  - 주의할 점은 1일일 때는 today 호출시 월도 이전달로 바꿔서 호출해줘야 하고 1월 1일일 경우 년도까지 이전 년도로 호출해줘야 하기 때문에 계산 로직 필요
- 데이터 조회하는 중에 시 or 구 or 동을 선택하면 조회한 결과 지역이 아닌, 조회 중간에 선택한 지역명이 노출되는 __`이슈`__ 발생
  - Loading 시에는 시 or 구 or 동을 클릭 못하도록 if문 통해서 __`처리`__
- 데이터를 fetch 하는 로직을 스토어로 옮기는 도중 commit 호출 값이 리턴되지 않는 __`이슈`__ 발생
  - 콘솔을 여기저기 찍으며 확인해봤지만 이상 있는 코드는 없었고, 스토어 내에서 commit 을 호출하면 리턴값을 받을 수 없는 것으로 생각됨
    - commit을 해주려 했던 함수에 리턴 대신 state에 값을 할당하는 방법으로 수정하여 __`처리`__
- 개발자 도구에 노출되는 앱 인증키를 가리기 위한 서버리스 함수 작업
  - Netlify 배포하였으나 __`CORS`__ 에러가 남
    - 구글링하여 axios 데이터 요청시 옵션으로 https의 httpsAgent 설정을 넣어줘서 __`해결`__
- 초단기 예보 시간 데이터의 순서가 제대로 안나오는 __`이슈`__ 발생
  - 최초 시간 데이터를 기준으로 데이터 정제할 때 targetTime값이 1000 또는 0600, 0700 등이 섞여 있을 경우 제일 앞에 숫자가 0보다 1이 우선이기 때문에 데이터 순서가 뒤바뀌어 생기는 이슈로 판단함
    - sort() 메소드로 처리할 수 있는지 확인 했는데 배열 안에 객체의 어느 한 값을 기준으로 정렬하기에는 로직이 복잡해지는거 같아서 __`lodash`__ 의 기능을 활용
      - __`lodash`__ 의 __`sortBy`__ 메소드로 이슈 해결하나 싶었지만 24시 데이터가 0000 으로 내려오는 __`이슈`__ 도 발생
        - 시간 기준이 아닌, 최초 데이터를 foreach 돌릴 때 __`index`__ 값으로 키값을 하나 생성해서 index 순서에 따라 lodash의 sortBy 메소드로 정렬 시켜서 __`처리`__