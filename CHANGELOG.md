# Changelog

All notable changes to Jacaré are recorded here automatically from Conventional Commits.

The npm packages `@jacare/*` and `create-jacare` share the same release version. VS Code and
Chrome DevTools extensions use independent release streams.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.13](https://github.com/jacarejs/core/compare/v0.1.12...v0.1.13) - 2026-07-28

### Added

- **cli:** add jacare why and Lab /why lesson ([e9dc46b](https://github.com/jacarejs/core/commit/e9dc46beb3e18c9963cb49b46e93befc24dfc6ac))
- **core:** attach WhyChain to ReactiveCycleError ([999776b](https://github.com/jacarejs/core/commit/999776bc1b6b10ad46eaba6d3e64743244aaf1b3))
- **devtools:** install $why and Why card ([5c8934c](https://github.com/jacarejs/core/commit/5c8934c33585b38e7a02cf7d82b72893940fa46e))
- **core:** add why() and formatWhyChain ([7a85e58](https://github.com/jacarejs/core/commit/7a85e58bb0b3c7f00eacfab99838e2d1efbf0234))
- **core:** DEV write ledger for why() ([61322d1](https://github.com/jacarejs/core/commit/61322d10b011ba3864793a919e77554c5543d1bf))
- **vscode:** add snippets for @route, jacare-when, and focus grip ([28bee8a](https://github.com/jacarejs/core/commit/28bee8a367f5171955ebb3674b30e2279bb9ffc5))
- ship DX facilities for focus, @route, jacare-when, and check --routes ([634fcbb](https://github.com/jacarejs/core/commit/634fcbbc795863d8d026a52023804bb7f9509760))
- **core:** add opt-in Patience scheduler with flushSync ([e08939f](https://github.com/jacarejs/core/commit/e08939f6392f78c927861ecfa276d6b80ab45127))
- **vscode:** add mountIsland snippet ([40aff0a](https://github.com/jacarejs/core/commit/40aff0a2dbd1f86610acefeecac5e11e20e84bed))

### Fixed

- dispose DevTools overlay on HMR reload ([cf35878](https://github.com/jacarejs/core/commit/cf35878cba3551d7ae9dce913cb3364c7a763ddf))
- **todo:** register orphan tutorial about and playground routes ([fe80252](https://github.com/jacarejs/core/commit/fe802528a78093a1caaf2d41dc7dc945660cc7f9))
- **core:** support catch-all :param* in matchPath ([d278966](https://github.com/jacarejs/core/commit/d278966961995685eb62af6d49a5c8a7cf9591ec))
- **compiler:** rewrite signals in class-* expressions ([7fc1c42](https://github.com/jacarejs/core/commit/7fc1c421266178df3cc8ad9fe8fed272488cef53))
- **compiler:** rewrite ternary consequent signals ([aadd736](https://github.com/jacarejs/core/commit/aadd7365fc6dc6a001fd3fb2ddfd1571e023bd82))
- **compiler:** skip string literals in rewriteSignalsInExpr ([5b7e271](https://github.com/jacarejs/core/commit/5b7e271776728dd57d9cba4f3852de57963a0069))
- **core:** prefer static segments in matchScreen scoring ([8f9c2bb](https://github.com/jacarejs/core/commit/8f9c2bb5eefc56ae025f627f3a60af1ff5d4e51c))
- **compiler:** emit SSR mixed text via string concat ([c262217](https://github.com/jacarejs/core/commit/c262217d6e839f9d89713a0c17cb629ef2b1ee16))
- **compiler:** ignore string literals when collecting expression refs ([a64c687](https://github.com/jacarejs/core/commit/a64c6872233247bb2786f1a9c65f5fb1c3177816))
- **examples:** bump island demos to 0.1.12 and sync in releases ([385e3af](https://github.com/jacarejs/core/commit/385e3aff34c7204d0ab745c9f2198a0f074cf3c1))

### Documentation

- **lab:** surface @route, jacare-when, focus, and check --routes ([d5d47f7](https://github.com/jacarejs/core/commit/d5d47f7b0b0ced06104876fceb4668db79e687e0))
- document DX facilities, imports, and Lab demos ([3ac52e6](https://github.com/jacarejs/core/commit/3ac52e68c0c6a9d70f8cff4dd7bcdc789125d66a))
- **api:** add Patience symbols to import catalog ([20b1584](https://github.com/jacarejs/core/commit/20b1584a6e08be4c120e5931f87bb8970a5e1088))
- **lab:** teach Patience scheduler and expand suite to 290 ([354319b](https://github.com/jacarejs/core/commit/354319b00ffc4594015fd3142c45d3ace1ac7d08))
- link Chrome Web Store listing for Jacaré Devtools ([d146e47](https://github.com/jacarejs/core/commit/d146e4754901c9aae377d024fb320d90621e2b82))

### Added

- **core:** `nav.go` / `swap` focus grip (`{ focus }`, `data-jacare-focus`); `getRouteParam` + `${@route/id}` template sugar
- **compiler:** contract `pulses` bare unwrap; `jacare-when={cond}`; route-scan helpers for `jacare check --routes`
- **cli:** `jacare check --routes`; compile errors print source snippets via `formatCompileError`
- **vscode:** snippets for `@route`, `jacare-when`, focus grip; highlight `data-jacare-*` (v0.0.16)

### Fixed

- **examples:** dispose `connectJacareDevtools()` on HMR (todo, showcase, bmi, studio, lab, scaffolds)

## [0.1.12](https://github.com/jacarejs/core/compare/v0.1.11...v0.1.12) - 2026-07-25

### Added

- **core:** add Island mount kit via @jacare/core/island ([75a4c48](https://github.com/jacarejs/core/commit/75a4c486abef7ab4a255dee7ac3450f0d19ac5b3))
- **examples:** show dynamic @jacare/core npm version in every demo ([afe72f3](https://github.com/jacarejs/core/commit/afe72f349bab8892a58c0191d76e34341702ab7d))

### Fixed

- **lab:** defer island mounts until view DOM exists ([9031d9b](https://github.com/jacarejs/core/commit/9031d9b320198b365d56b6b344dcb6d9d300029e))

### Changed

- add Islands lesson for mountIsland API §14b ([c3cae22](https://github.com/jacarejs/core/commit/c3cae22ab43e95e49dc134ca79ca8bd8cb59814b))
- add Angular host for Jacaré islands ([18e54a8](https://github.com/jacarejs/core/commit/18e54a873448e5db45adf2bd8f64cc69c6474939))
- add React and Vue hosts for Jacaré islands ([9829b7e](https://github.com/jacarejs/core/commit/9829b7eee3a1ff4c03145481b8ef065de6dd6680))
- add static HTML host for Jacaré islands ([ef96484](https://github.com/jacarejs/core/commit/ef964845d7e271d6327f4de0437c478bb039b2c1))

### Added

- **core:** Island mount kit via `@jacare/core/island` (`mountIsland`) with static host demo
- **examples:** React, Vue, and Angular hosts embedding Jacaré islands

## [0.1.11](https://github.com/jacarejs/core/compare/v0.1.10...v0.1.11) - 2026-07-25

### Added

- **release:** automate versioned changelog and release notes ([c8b9fe0](https://github.com/jacarejs/core/commit/c8b9fe00fc4770ef467e077466803f6f393deca9))
- **devtools:** mesh export/import and numeric steppers in Lookout overlay ([85f1b21](https://github.com/jacarejs/core/commit/85f1b2178bac86bf6dd2d57fb490f348f74f48de))
- **devtools:** name extension Jacaré and brand overlay as Lookout ([92375e8](https://github.com/jacarejs/core/commit/92375e8cf7e22a4a4b645b3c60e23b61f8e121b6))
- **devtools:** add Scope tab and Vite DEV hook inject ([aed0518](https://github.com/jacarejs/core/commit/aed05183da4cdd13aa666cfe2dad942a9dcdd1a7))
- **devtools:** rename Pulse Graph to State and simplify Chrome panel ([0e2ba89](https://github.com/jacarejs/core/commit/0e2ba899517e7fdfb73436ea1335750dba74a706))
- **devtools:** mirror overlay Pulse Graph in Chrome panel ([c337c09](https://github.com/jacarejs/core/commit/c337c090139766f1437487459ea41c17a6f8357f))
- **devtools:** inspect .jcr pulses, values, and current route in Chrome panel ([028b145](https://github.com/jacarejs/core/commit/028b145c8a966a457017a6cfd851c9ed416dd941))
- **devtools:** scaffold Chrome DevTools extension and store publish Action ([443a78c](https://github.com/jacarejs/core/commit/443a78c1fd6e5d4ab37e81366c87605286f956ce))
- **lab:** Binding IR lesson, DevTools toggle, and forms/playground fixes ([3a3acae](https://github.com/jacarejs/core/commit/3a3acae56f22b8fedbbc244fb75ec0365bcbefe1))

### Fixed

- **docs:** align leftover demo ports and done-task CSS ([ba83b9a](https://github.com/jacarejs/core/commit/ba83b9ae12424becfe3cc56197563d546fcb5940))
- **docs:** align leftover demo ports and done-task CSS ([09c78d0](https://github.com/jacarejs/core/commit/09c78d04b2cc47b03de59fb4fbabce386226758c))
- **meta:** keep mid-path index segments in file routes ([9aba63d](https://github.com/jacarejs/core/commit/9aba63dc1c4d2ce5d4e92533fa1e93c1142c468f))
- **cli:** use file URLs for config and refuse compile overwrite ([8eb3bd4](https://github.com/jacarejs/core/commit/8eb3bd4a7461ae85435ec4f5de6e8118ff704ad0))
- **compiler:** escape single quotes in HTML output ([f99007f](https://github.com/jacarejs/core/commit/f99007f7febcf99486a860427a16a67a8b5e90a4))
- **core:** ignore deferred effects after dispose ([7d275d3](https://github.com/jacarejs/core/commit/7d275d38c6b98d0780842a16dba9c08f38b57234))
- **devtools:** harden dispose/escape and align README with shipped API ([a6098c5](https://github.com/jacarejs/core/commit/a6098c55214f0c0480c072890329eed3797aea29))
- **vscode:** stop forcing global theme defaults and build before pack ([7047c3b](https://github.com/jacarejs/core/commit/7047c3b04f4d555baed4e5b46afc022290ba8061))
- **chrome-devtools:** drop unused scripting permission and rebuild ZIP cleanly ([de8d943](https://github.com/jacarejs/core/commit/de8d9431a0711ca9927d2bce7865bc6d7ac78188))
- **templates:** style completed tasks with .done class ([382d98f](https://github.com/jacarejs/core/commit/382d98fc656fa0b22c2591a845bc28d59e6681e9))
- **examples:** correct demos, ports, versions, and CodeModal a11y ([f619c3e](https://github.com/jacarejs/core/commit/f619c3e8d9779e1d5692e137cf2dc3c843fff50f))
- **core:** stop effects from re-exploding after throw ([e21225d](https://github.com/jacarejs/core/commit/e21225dd9574149ad3bf8edb29eefa9cf8253b93))
- **devtools:** hide mesh/scope panes when overlay is minimized or hidden ([6165226](https://github.com/jacarejs/core/commit/61652269bb596e2248b340b6c49fb9647324a0ef))
- **core:** detect reactive cycles instead of overflowing the stack ([5d9d241](https://github.com/jacarejs/core/commit/5d9d2417d6b15519f09e2ac63a71dd1aef63ed8a))
- **lab:** avoid top-level await in boot for Vite build target ([8f02eaf](https://github.com/jacarejs/core/commit/8f02eaf8410d2c31ee42f81f6e3b973e58ed768d))

### Documentation

- align public docs with current package version and suite size ([ae6ad5f](https://github.com/jacarejs/core/commit/ae6ad5f6c0bf88b682fe840bd91e0f576c8ffecc))
- align ripple examples with ripple(fn) API ([e4d528c](https://github.com/jacarejs/core/commit/e4d528c963a29f68fd2b610c4de9cb5f9c231d12))
- **nav:** expand route API and Lab with real use cases ([19d7ebc](https://github.com/jacarejs/core/commit/19d7ebcd0148870c85620e5d252bf6040368816a))
- **chrome-devtools:** add store privacy policy ([acef980](https://github.com/jacarejs/core/commit/acef980c3dc79d49dcff9d65401e03b8868162b4))
- **lab:** add detailed English explanations for every import catalog entry ([1482882](https://github.com/jacarejs/core/commit/14828823823cbe1aa35199f09d54ad6aacb0ba75))
- **lab:** add simple English usage examples for every import ([b1a5e6e](https://github.com/jacarejs/core/commit/b1a5e6e25ca8a440be62f99765128a0cd27e681b))

### Maintenance

- add MIT LICENSE at repository root ([d934767](https://github.com/jacarejs/core/commit/d9347679f9f2d8aced04c921b32424da0e6effab))
- **templates:** move global styles from index.html into app.css ([f93b60d](https://github.com/jacarejs/core/commit/f93b60d8cdde4e61f20ed43621342a144ab95095))
- **templates:** align starters with canonical nav and pulse API ([9bf30a2](https://github.com/jacarejs/core/commit/9bf30a2690ca0f88c290b47d35d7a88b51e9f5e7))

## [0.1.10](https://github.com/jacarejs/core/compare/v0.1.9...v0.1.10) - 2026-07-22

### Added

- **showcase:** rebuild tutorial site with arcade and studio ([5f63b48](https://github.com/jacarejs/core/commit/5f63b485c093636a94a7da925c65b39cae8b016b))
- **vscode:** add Pulse Mesh snippets, links highlight, and @bag/key scopes ([bd830d9](https://github.com/jacarejs/core/commit/bd830d95e0b97d58cc4ebad41921b9486a2f6a1c))
- **compiler:** add @bag/key mesh address sugar via getBag ([60d96d2](https://github.com/jacarejs/core/commit/60d96d23a03b1bfe9cf874b420080b5e4ec1b4fc))
- defer bag factory on getBag and emit mesh port slice hints ([b2d32d4](https://github.com/jacarejs/core/commit/b2d32d45485dc50966a700d685a69420801a9645))
- contract Mesh links and jacare check for published ports ([5b918a9](https://github.com/jacarejs/core/commit/5b918a9c82d57fcdc751b69bf04b65692452ef38))
- **compiler:** lower bag members to Mesh Port bindText/CPW ([9322e67](https://github.com/jacarejs/core/commit/9322e67700ef6f337230d5550c08dbd565662caa))
- **devtools:** nest Scope as Pulse Graph tab with pop-out ([d996d2d](https://github.com/jacarejs/core/commit/d996d2d4935bd762cc3a4cc3425d3f44a4cc0a2e))
- **devtools:** add Mesh panel for createBag addresses ([cfe697b](https://github.com/jacarejs/core/commit/cfe697b49ef663686490543d64de2982aead7233))
- **core:** add createBag shared pulse mesh with shop and lab demos ([9c02756](https://github.com/jacarejs/core/commit/9c02756bf6031942416a1aa5fa7e41277478b934))
- teach expression style in VS Code and include imports in lab modals ([3e67f20](https://github.com/jacarejs/core/commit/3e67f202ba639eb4c4cc678aaf54e7ff55f0d754))
- **compiler:** warn on redundant template arrows per expression convention ([63f4c75](https://github.com/jacarejs/core/commit/63f4c7598e7d76a28009a2e2cf8cf667b99948df))
- **compiler:** close Binding IR audit gaps (MountPlan, SSR leaf, check --bindings) ([d95a431](https://github.com/jacarejs/core/commit/d95a431a24c6982723e554556c795b4dadb03784))
- **compiler:** drive contract check from component IR ([2061cc6](https://github.com/jacarejs/core/commit/2061cc6c0b3f7184f7a521940b52caa6c081095e))
- **compiler:** add IR optimize passes for CPW and if DCE ([fbb348d](https://github.com/jacarejs/core/commit/fbb348d796c985bf8b7c2f7f59f7c92c38a22814))
- **compiler:** lower component props/slots to IR ([a2e6104](https://github.com/jacarejs/core/commit/a2e6104ea839dd39450429ce3be5e313535578ff))
- **compiler:** lower if/case/for to shared flow IR ([07cd794](https://github.com/jacarejs/core/commit/07cd7943bc511acd33083efb0c69f54f80fc3e03))
- **compiler:** emit leaf binding IR ops ([c4dd5f9](https://github.com/jacarejs/core/commit/c4dd5f9b961cc9e73c9dfaeb0d7a3a4653c512e0))
- **compiler:** extract BindingSource lower for IR slice 0 ([490ca3d](https://github.com/jacarejs/core/commit/490ca3d208584685c71315ac389075ae876e42f2))

### Fixed

- **devtools:** keep Mesh/Scope pop-out only in tab toolbar ([5c5f167](https://github.com/jacarejs/core/commit/5c5f167ec5fe08a45f278d67ccdbbd72e6ae714f))
- **devtools:** show Mesh/Scope tabs only with data and add Reset ([f6b138a](https://github.com/jacarejs/core/commit/f6b138a6cd837a9437eb4c1ef251c874f214199f))
- **lab:** split bag demos into lab-cart and lab-tree ([cad3233](https://github.com/jacarejs/core/commit/cad3233b23d1c402d1e2a32d0c945f110c48477e))
- **core:** soft-reset bags so mounted UI stays subscribed ([cc35c95](https://github.com/jacarejs/core/commit/cc35c95fd93b14588ae41c6bedba333a283d9323))
- **devtools:** nest Mesh as Pulse Graph tab with pop-out ([dbd53b8](https://github.com/jacarejs/core/commit/dbd53b8d118edfda193780a8a9d01936e6639762))

### Changed

- **compiler:** unify bind/CPW apply helpers ([2f705cc](https://github.com/jacarejs/core/commit/2f705cc806d1a812e92b908b9f02ad776af23b70))

### Documentation

- add full language reference for reserved words, binds, and CLI ([eb528e4](https://github.com/jacarejs/core/commit/eb528e4a55cd00992b2db323b8b9f269df7cd0d7))
- document Pulse Mesh architecture in API and README ([c50dcdb](https://github.com/jacarejs/core/commit/c50dcdb507c574364f2dce972fb94d0596ef055d))
- **lab:** explain Pulse Mesh architecture on the bag lesson ([56e99b0](https://github.com/jacarejs/core/commit/56e99b0b018f5136d4c8d48ac8504e11056236d5))
- **lab:** show pulse bag across four nested components ([e0305f7](https://github.com/jacarejs/core/commit/e0305f7cef6f51a258b1249646f79061d62dd25e))
- document Binding IR and update lab/showcase examples ([cc5e886](https://github.com/jacarejs/core/commit/cc5e88631710674124ffd4315932d374a6f4187d))

## [0.1.9](https://github.com/jacarejs/core/compare/v0.1.8...v0.1.9) - 2026-07-20

### Added

- **examples:** mobile kanban drag, new suite demos ([a4dc4a3](https://github.com/jacarejs/core/commit/a4dc4a3fae16dd0225ae222d005cd5413a7a564a))

### Fixed

- **nav:** remount screens when layout frame is replaced or path repeats ([73bad5f](https://github.com/jacarejs/core/commit/73bad5fa27abcb27f74b78a241fd9d8128a613e9))

## [0.1.8](https://github.com/jacarejs/core/compare/v0.1.7...v0.1.8) - 2026-07-20

### Added

- add setNavTitle and Focus duration presets ([9a91770](https://github.com/jacarejs/core/commit/9a917700ea043cc2db9405f9299b36df0273191a))
- **nav:** add export const title for route screens ([ffbeb7e](https://github.com/jacarejs/core/commit/ffbeb7ed8a4c075392c5b5e40d9abed35013b437))
- **todo:** add tic-tac-toe CPU opponent with difficulty levels ([406ae45](https://github.com/jacarejs/core/commit/406ae4515327e100faa6d7681152eac14d43a93f))
- **todo:** add football league simulator with crests and table ([bdaf067](https://github.com/jacarejs/core/commit/bdaf067500eb21d3a467c880b0d3965c4893acb5))
- **todo:** add Focus, Invite, and Split suite demos ([c07a6ca](https://github.com/jacarejs/core/commit/c07a6ca247a7e515cca12a7410868cabf040fc98))
- **devtools:** highlight changed JSON lines in Pulse Graph value ([bcfc9b3](https://github.com/jacarejs/core/commit/bcfc9b3a4008a458b74e7b92a57692e9285a1c6d))
- **todo:** add View code modal with copy like lab ([7503ebe](https://github.com/jacarejs/core/commit/7503ebefde600be9b97a01eab680b441a9dfd7fc))
- **todo:** redesign suite with kanban and tic-tac-toe ([1e137dc](https://github.com/jacarejs/core/commit/1e137dc1c9e75bc4d1b440450a6ce6e2a68bd23e))
- **devtools:** add panel config, move, and clear actions ([e458986](https://github.com/jacarejs/core/commit/e4589867a852b4f279f03ae2e815a1a9642f6541))
- **devtools:** add source names and DOM binding highlights ([7bc24dd](https://github.com/jacarejs/core/commit/7bc24dd162683a4111e5abe020694c264892c393))
- **debug:** add dev-only <debug> tag with copy support ([b2e0d3b](https://github.com/jacarejs/core/commit/b2e0d3b14bb57df9520349c201f4ebcd54285964))
- **style:** support #if/#for/#case in export <style> ([d6ce86f](https://github.com/jacarejs/core/commit/d6ce86f8b29b339b89f94d72d939421e674716b9))
- **compiler:** add #case / #when match control flow ([142f604](https://github.com/jacarejs/core/commit/142f60450458f38ebf9950aa9054b479bc1dbbf0))
- **bench:** add list-toggle, mount-cold, hydrate, ssr, compile, bundle ([580e7cc](https://github.com/jacarejs/core/commit/580e7ccaf620cfe8670118ff8c93ed7190cd55f5))
- **vscode:** highlight <contract> and add Jacaré snippets ([cce2fc7](https://github.com/jacarejs/core/commit/cce2fc71e2ec10e777094f388d5fe4f2d53682b7))

### Fixed

- **compiler:** unwrap debug object shorthand and safe text imports ([ecc4318](https://github.com/jacarejs/core/commit/ecc43187b50219b0fb7348ea223759ebd8bc2353))
- **todo:** evaluate league score and crest text expressions ([ebcce7c](https://github.com/jacarejs/core/commit/ebcce7caba4cd97c21873c66d0eb17722e9aa969))
- **compiler:** call arrow text exprs; add getNavTitle ([ed60b69](https://github.com/jacarejs/core/commit/ed60b698ee84a3d48a3e9e824cf60ffa943b5bdb))
- **devtools:** keep value flashes in Pulse Graph only; set titles in nav ([7f35287](https://github.com/jacarejs/core/commit/7f3528746932cd1329c3790c6ad01250ef8f9a6f))
- **devtools:** add Scope minimize and live example on Tasks ([2df9d4f](https://github.com/jacarejs/core/commit/2df9d4fe35d453d7580698473b7a23d5e178c199))
- **devtools:** name store pulses and bind imported signals for highlight ([7c407c5](https://github.com/jacarejs/core/commit/7c407c5358eb979ee44ae83fb0576f1c40c6d078))
- **jacare-lab:** contain horizontal code scrolling inside modal ([7213c9e](https://github.com/jacarejs/core/commit/7213c9e6e43bf3adc5642690ea8abc9f418f1844))
- **pages:** route Lab SPA refreshes correctly and improve code modal copy ([56e7bee](https://github.com/jacarejs/core/commit/56e7beeac519370e56d7b3178247666beb14fd0f))
- **vscode-jacare:** keep only Marketplace banner in README ([62df2b2](https://github.com/jacarejs/core/commit/62df2b2da8dad0cdf8e13ef0a5aca53efd6013dd))
- **vscode-jacare:** replace Marketplace banner with Jacaré logo in README ([1a49741](https://github.com/jacarejs/core/commit/1a497415590476279e825060e0245f7c37689ee6))

### Performance

- **todo:** cut boot weight with lazy routes, lighter assets, and CSS ([413552b](https://github.com/jacarejs/core/commit/413552b18cf6b61179ce5d8ed667652d7af1ff5a))

### Changed

- **todo:** improve mobile layout across the suite ([4e7c2d4](https://github.com/jacarejs/core/commit/4e7c2d473dd48a4e4cb55e3ad54ac981bd383c47))
- **todo:** move suite styles into app.css" ([91a9a39](https://github.com/jacarejs/core/commit/91a9a39adee9fc13f743f518616db1c4f1b2a48b))

### Tests

- fix todo harness for devtoolsBind and suite title expectation ([6b2675b](https://github.com/jacarejs/core/commit/6b2675bc795e864fdb4fc51b7f11fc9727a603f7))

## [0.1.7](https://github.com/jacarejs/core/compare/v0.1.6...v0.1.7) - 2026-07-16

### Added

- **jacare-lab:** document nav boot options and add live route simulators ([0c19449](https://github.com/jacarejs/core/commit/0c19449350595b6a4ec2d7dc4acf6c80d0ac13c5))
- **lab:** add VS Code Marketplace card and store banner asset ([1031d9a](https://github.com/jacarejs/core/commit/1031d9a16b3b365a8d00894bafa9e644f9946be8))
- **lab:** add background swap demo with if on conditionals page ([3988be4](https://github.com/jacarejs/core/commit/3988be4c0fd3aa08d27f58a757c17212daffe5f3))
- **lab:** expand events lesson with full API demos ([232eb7f](https://github.com/jacarejs/core/commit/232eb7fa0ab37f4bd394a4979a5862a4aac77b8b))
- **compiler:** typed contract props with model bind- and defaults ([4cf1aca](https://github.com/jacarejs/core/commit/4cf1aca9d6f7be753bb34b6606258b0c2068f637))
- **compiler:** add template contracts and check validation ([9f38eb1](https://github.com/jacarejs/core/commit/9f38eb139b8cebc1baa47d34e2cf6072c169f667))

### Fixed

- **jacare-lab:** repair Demo View code and add lifecycle cycle diagram ([013f3d9](https://github.com/jacarejs/core/commit/013f3d96504c8a79a46a7a9de66c57f312a62a6a))
- **lab:** show route.path value on topic param page ([e1dfc5f](https://github.com/jacarejs/core/commit/e1dfc5fdf6f16d5dfcef97f42b3acf0959475bfd))
- prevent duplicated shell on HMR remount ([6b5991a](https://github.com/jacarejs/core/commit/6b5991ac6a98631e2e628c9ae11fe65eb00723de))
- **lab:** make bindings gauge arc follow --angle ([6ea861c](https://github.com/jacarejs/core/commit/6ea861c4ff0263312b3d1ed2a35a1b17932f79b3))
- **lab:** restore View code spacing and add install intro on home ([f7e3c0f](https://github.com/jacarejs/core/commit/f7e3c0fac368572363c67208e5bbe4125799a412))

### Changed

- **jacare-lab:** extract demo sources into src/snippets ([b48f470](https://github.com/jacarejs/core/commit/b48f470be9a2c5fa887216b6b1b9be246ed4c85e))

### Documentation

- feature Jacaré Lab tutorial and add Made in Brazil footer ([a6286f8](https://github.com/jacarejs/core/commit/a6286f88831663d0b384bc8f562833704e78b6c4))
- add project badges and document recent API features ([42b7e56](https://github.com/jacarejs/core/commit/42b7e56acdee13895bad73aea0ec3d2344004a70))

### Maintenance

- redeploy GitHub Pages after npm publish ([8d05ee1](https://github.com/jacarejs/core/commit/8d05ee152502783871f83fd5fccf8b8f1fc6bddc))

## [0.1.6](https://github.com/jacarejs/core/compare/v0.1.5...v0.1.6) - 2026-07-16

### Added

- **examples:** add Scale BMI demo and deploy on GitHub Pages ([9373faf](https://github.com/jacarejs/core/commit/9373faf13389c186e0d209409aca304b8773f1b2))

### Fixed

- **devtools:** track pulses before enable and improve Pulse Graph panel ([f43ae83](https://github.com/jacarejs/core/commit/f43ae83c05f77ea128f0e9514bfa9dfaa6f92166))
- resolve #for parent from anchor inside #if ([2fe13ea](https://github.com/jacarejs/core/commit/2fe13eacc85142aa86cf694ee8908b2080c05163))
- **runtime:** preserve multi-child fragment order in keyed lists ([b688dcb](https://github.com/jacarejs/core/commit/b688dcb4da6bdd4600d0b19d0c2ca19a5e9d7f52))
- **runtime:** preserve source order in branch/showIf mounts ([2f100a5](https://github.com/jacarejs/core/commit/2f100a55a3644726eb13833eea1ce2c036d8c8d1))

### Documentation

- expand API for events, #if, #for and link from README ([4ab4480](https://github.com/jacarejs/core/commit/4ab4480b3a6805db4caf9e253da123e8ea594610))
- add npm package links and global @jacare/cli install ([89d03b1](https://github.com/jacarejs/core/commit/89d03b1630aeee94448e1d695975f5f970007bdf))

## [0.1.5](https://github.com/jacarejs/core/compare/v0.1.4...v0.1.5) - 2026-07-13

### Fixed

- **showcase:** render cart lines below count with stable DOM order ([82bb222](https://github.com/jacarejs/core/commit/82bb2221ad81df585262475a32d5867200aab09c))
- **ci:** verify Pages artifact and add SPA 404 fallbacks for demos ([1d34b17](https://github.com/jacarejs/core/commit/1d34b17b5f2ff9389a83803ed4a4dd3b871b5521))

## [0.1.4](https://github.com/jacarejs/core/compare/v0.1.3...v0.1.4) - 2026-07-12

### Added

- CPW production wiring, style--- CSS vars, and pulse benchmarks ([7d86024](https://github.com/jacarejs/core/commit/7d8602473aea9092fdcb0ae85da3f8b1f69455c1))

### Fixed

- **showcase:** improve mobile layout, nav menu, and cart responsiveness ([a123b68](https://github.com/jacarejs/core/commit/a123b6828b7d5c59f4e2c5edf808660b2e3a964f))
- avoid var(--pct) CSS blocks being parsed as template expressions ([9669a0b](https://github.com/jacarejs/core/commit/9669a0b31220d144be6cefea7d7735af1bccb6fd))

### Changed

- **showcase:** move styles to app.css and hide unused scope devtools panel ([4cc34de](https://github.com/jacarejs/core/commit/4cc34de9a7216c9755ddf5af328a0c0f9db4ad4c))

### Documentation

- document CPW, style--- bindings, benchmarks, and showcase performance page ([499e4c0](https://github.com/jacarejs/core/commit/499e4c037e2ee0184b04b0446515251d3d949080))
- add testing guide, expand section 9, and refresh all documentation ([23b22c9](https://github.com/jacarejs/core/commit/23b22c98f1f9f9854205a5d87b4ac7b3a898d06b))

## [0.1.3](https://github.com/jacarejs/core/compare/v0.1.2...v0.1.3) - 2026-07-12

### Fixed

- **showcase:** align workspace @jacare deps to fix Pages build ([deb8ffb](https://github.com/jacarejs/core/commit/deb8ffb88770a3b922717dccce3060ebc51d49f1))
- **build:** embed inline sources in published source maps ([1bdb84e](https://github.com/jacarejs/core/commit/1bdb84e536736f547b697f19cc73ee54894c740f))

## [0.1.2](https://github.com/jacarejs/core/compare/v0.1.0...v0.1.2) - 2026-07-12

### Added

- **create-jacare:** brand-themed minimal starter with logo and VS Code link ([ad9f722](https://github.com/jacarejs/core/commit/ad9f722691989c8f75a15683cd7ae8df6d75d759))
- **devtools:** add minimize toggle to Pulse Graph panel ([edc19f3](https://github.com/jacarejs/core/commit/edc19f3ecdb13690e9763116d341d7085ef8597e))
- add jacare-showcase demo app with brand colors and feature demos ([2d8201b](https://github.com/jacarejs/core/commit/2d8201b77e835b683cedea402cebf31b5abfc8ff))

### Fixed

- **ci:** skip already-published npm versions and sync repo to 0.1.1 ([c186e94](https://github.com/jacarejs/core/commit/c186e949f7b58e676795c6f359b5ca8e0122f5cc))
- **pages:** deploy todo at /core/todo and update demo links ([3f87524](https://github.com/jacarejs/core/commit/3f8752429967d857fd83fe201bad70eb9db60c79))
- **pages:** deploy todo at site root and showcase at /core/showcase ([908e2c2](https://github.com/jacarejs/core/commit/908e2c2cc2dbc6131679f653107eb65ad9c7216c))
- **showcase:** equalize feature card heights on home grid ([434b805](https://github.com/jacarejs/core/commit/434b80572fb41020a4a0d35a55423c3ee5baf92c))
- **compiler:** import bindPropText in generated client code ([7d90c60](https://github.com/jacarejs/core/commit/7d90c605b7da2ee1fdcd49eca219f652ae584141))
- showcase demos, static component props, and dual GitHub Pages deploy ([5d30bc2](https://github.com/jacarejs/core/commit/5d30bc27473d72394e98b45cecf47b43b34adfde))

### Changed

- **examples:** migrate jacare-todo to export view/style block syntax ([c5230a3](https://github.com/jacarejs/core/commit/c5230a34812a0c190644f03f2b8cd891110b2aa7))

### Documentation

- increase logo size in README and documentation ([ce44746](https://github.com/jacarejs/core/commit/ce447465abc6fc76b74e86aa79961e02b57247ab))
- expand README syntax with simple module and components/props examples ([c42cec3](https://github.com/jacarejs/core/commit/c42cec393e42e259144813c02e6ca4179a449aba))
- add comprehensive API reference and update syntax guides ([42ff54c](https://github.com/jacarejs/core/commit/42ff54cc9fe9cc240fd766f1104a385e4ee9353f))
- **vscode:** add full English README for Jacaré extension ([886c500](https://github.com/jacarejs/core/commit/886c500ec5feaade3c1b64779534e09440147e6c))

## [0.1.0](https://github.com/jacarejs/core/compare/891b1162bdfc12083cc2412b42207d0ca4cbcc32...v0.1.0) - 2026-07-12

### Added

- add scoped CSS, slots, meta-framework, and VS Code extension ([c7fd8ad](https://github.com/jacarejs/core/commit/c7fd8ada71e875f558a6568c8bbd53b254ebd8f7))
- initial project ([891b116](https://github.com/jacarejs/core/commit/891b1162bdfc12083cc2412b42207d0ca4cbcc32))

### Fixed

- **nav:** subpath base routing and update jacare-todo example ([5e12a69](https://github.com/jacarejs/core/commit/5e12a69d2c2f9b7a8d5792dc37bb236148b1159c))

### Performance

- **runtime:** O(1) DependencyCell.has and document section 7 ([9ff4b66](https://github.com/jacarejs/core/commit/9ff4b66f22391b4525fe3c7152629a993597380a))

### Documentation

- update compiler docs and sugestoes with current project state ([98f29b7](https://github.com/jacarejs/core/commit/98f29b779bbdd60f5f8e6a1175d6ee1033876a2e))
- expand npm package READMEs with detailed English guides ([7811bb0](https://github.com/jacarejs/core/commit/7811bb094e509bdb58c3953b3fcd398540f3689e))
- add README for each @jacare npm package ([cf5d7b0](https://github.com/jacarejs/core/commit/cf5d7b04e3524a4511c6bf1454306dc242b8bfc6))

### Maintenance

- auto-bump versions on npm and vscode publish workflows ([528ccce](https://github.com/jacarejs/core/commit/528ccce63dc752a4af0613db5ec4423c80d6f020))
- bump packages to 0.0.3 and fix repository urls ([7168501](https://github.com/jacarejs/core/commit/7168501400463f7aed45d07a7b86af5cdbdfa39f))
- **vscode:** add .gitignore to jacare extension package ([278efea](https://github.com/jacarejs/core/commit/278efea1ebd8cb1c27d3821648f98007d21dccbb))
- bump all packages to 0.0.2 ([8d96130](https://github.com/jacarejs/core/commit/8d961301f83d03c3f3527c5fe7ea5dddd179d0ee))
- add GitHub Pages deploy for jacare-todo demo ([9891474](https://github.com/jacarejs/core/commit/9891474a6f7be55d27d84609abca048a3a284b5b))
- add npm publish workflow for @jacare packages ([daacf15](https://github.com/jacarejs/core/commit/daacf15e5e26014694d6d02d879edc161ffa127d))

