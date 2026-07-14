# 馃幍 Musicist 鈥?鍙戠幇浣犵殑闊充箰涓栫晫

涓€涓幇浠ｅ寲鐨勫湪绾块煶涔愭挱鏀惧櫒锛屾敮鎸佸闊虫簮鎼滅储銆佹瘡鏃?Bing 澹佺焊銆佸脊骞曚簰鍔ㄣ€丄I 鎺ㄨ崘绛夊姛鑳姐€?
> **鍦ㄧ嚎鍦板潃锛?* https://zhuyao-opendeveloper.github.io/musicist/

---

## 鉁?鍔熻兘

- 馃幎 **澶氶煶婧愭悳绱?* 鈥?鍐呯疆澶氫釜闊充箰婧愶紝鏀寔鍦ㄧ嚎妫€绱?- 馃敟 **鐑棬鎺ㄨ崘** 鈥?鍙戠幇褰撲笅鐑棬鐨勯煶涔愭洸鐩?- 鉂わ笍 **鏀惰棌绠＄悊** 鈥?鏀惰棌浣犲枩娆㈢殑姝屾洸
- 馃柤锔?**姣忔棩 Bing 澹佺焊** 鈥?鑳屾櫙姣忔棩鑷姩鏇存柊
- 馃幆 **寮瑰箷浜掑姩** 鈥?杈瑰惉姝岃竟鍙戝脊骞?- 馃 **AI 鎺ㄨ崘** 鈥?鏅鸿兘鎺ㄨ崘浣犲彲鑳藉枩娆㈢殑闊充箰
- 馃敡 **绠＄悊鍚庡彴** 鈥?鑷畾涔夐煶婧愩€佺鐞嗘瓕鏇插拰寮瑰箷
- 馃寵 **娣辫壊涓婚** 鈥?娌夋蹈寮忕殑娣辫壊鐣岄潰璁捐

## 馃洜锔?鎶€鏈爤

| 鎶€鏈?| 鐢ㄩ€?|
|------|------|
| **Vue 3** + Composition API | 鍓嶇妗嗘灦 |
| **Vite 6** | 鏋勫缓宸ュ叿 |
| **Vue Router 4** | 鍓嶇璺敱 |
| **Tailwind CSS 3** | 鏍峰紡妗嗘灦 |
| **lucide-vue-next** | 鍥炬爣搴?|
| **pnpm** | 鍖呯鐞?|

## 馃殌 鏈湴杩愯

```bash
# 瀹夎渚濊禆
pnpm install

# 鍚姩寮€鍙戞湇鍔″櫒锛堝惈 API 浠ｇ悊锛?pnpm dev

# 鏋勫缓鐢熶骇鐗堟湰
pnpm build

# 棰勮鏋勫缓浜х墿
pnpm preview
```

寮€鍙戞湇鍔″櫒榛樿杩愯鍦?`http://localhost:5173`锛孷ite 宸查厤缃?`/api-proxy/deezer` 浠ｇ悊缁曡繃闊充箰 API 鐨?CORS 闄愬埗銆?
## 馃摝 閮ㄧ讲

椤圭洰浣跨敤 **GitHub Actions** 鑷姩鏋勫缓骞堕儴缃插埌 GitHub Pages銆傛帹閫?`main` 鍒嗘敮鍚庯紝宸ヤ綔娴佷細鑷姩锛?
1. 瀹夎渚濊禆
2. 鎵ц `vite build`
3. 灏?`dist/` 鐩綍閮ㄧ讲鍒?Pages

> **璺敱璇存槑锛?* 椤圭洰閮ㄧ讲鍦ㄥ瓙璺緞 `/musicist/` 涓嬶紝Vite 閰嶇疆 `base: '/musicist/'`锛孷ue Router 浣跨敤 `createWebHistory('/musicist/')`銆?
## 馃搧 椤圭洰缁撴瀯

```
musicist/
鈹溾攢鈹€ .github/workflows/    # GitHub Actions 閮ㄧ讲宸ヤ綔娴?鈹溾攢鈹€ public/               # 闈欐€佽祫婧?鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ components/       # 缁勪欢锛堟挱鏀惧櫒銆佸脊骞曘€佹瓕鍗曞崱鐗囩瓑锛?鈹?  鈹溾攢鈹€ composables/      # 缁勫悎寮?API锛堥煶涔愩€佸脊骞曘€丄I 绛夛級
鈹?  鈹溾攢鈹€ router/           # 璺敱閰嶇疆
鈹?  鈹溾攢鈹€ views/            # 椤甸潰锛圚ome銆丄dmin锛?鈹?  鈹溾攢鈹€ App.vue           # 鏍圭粍浠?鈹?  鈹溾攢鈹€ main.js           # 鍏ュ彛鏂囦欢
鈹?  鈹斺攢鈹€ style.css         # 鍏ㄥ眬鏍峰紡锛圱ailwind + 鑷畾涔夛級
鈹溾攢鈹€ index.html            # 鍏ュ彛 HTML
鈹溾攢鈹€ vite.config.js        # Vite 閰嶇疆
鈹溾攢鈹€ tailwind.config.js    # Tailwind 閰嶇疆
鈹斺攢鈹€ pnpm-lock.yaml        # pnpm 閿佹枃浠?```

## 馃搫 璁稿彲璇?
MIT
