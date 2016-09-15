/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","getmac","crypto","vs/base/common/winjs.base","vs/base/common/errors","vs/base/common/uuid"],function(e,t,n,r,c,o,s){"use strict";function a(){return new c.TPromise(function(e){try{n.getMac(function(t,n){e(t?s.generateUuid():r.createHash("sha256").update(n,"utf8").digest("hex"))})}catch(t){o.onUnexpectedError(t),e(s.generateUuid())}})}t.getMachineId=a});