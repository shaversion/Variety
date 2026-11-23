// THREE js revision
if (THREE.REVISION > 71) {
	THREE.ParticleBasicMaterial = THREE.PointsMaterial;
	THREE.ParticleSystem = THREE.Points;
}
else 
if (THREE.REVISION > 67) {
	THREE.ParticleBasicMaterial = THREE.PointCloudMaterial;
	THREE.ParticleSystem = THREE.PointCloud;
}
if ((typeof _typeface_js !== 'object') && (typeof THREE.FontLoader === 'function')) {
	_typeface_js = new THREE.FontLoader();
	_typeface_js.loadFace = function(json) { this._font = _typeface_js.parse(json); };
	THREE.FontUtils = {
		generateShapes:  function(f,p) { return _typeface_js._font.generateShapes(f,p.size); } 
	}; 
} 
if (typeof WeakMap !== 'function') {
	var WeakMap = function() { this.clear(); return this; };
	WeakMap.prototype.delete = function(key) {
		var keys = this.key, l = keys.length;
		for (var i = 0; i < l; i++) {
			if (keys[i] === key) {
				if (i !== --l) {
					this.key[i] = this.key[l];
					this.value[i] = this.value[l];
					//this.stamp[i] = this.stamp[l];
				}
				this.key.pop();
				this.value.pop();
				//this.stamp.pop();
				break;
			}		
		}
		return;
	};
	WeakMap.prototype.clear = function() {
		this.value = [];
		this.key = [];
		//this.stamp = [];
		//this.time = 0;
	};
	WeakMap.prototype.get = function(key) {
		var keys = this.key, l = keys.length;
		for (var i = 0; i < l; i++) {
			if (keys[i] === key) {
				//this.stamp[i] = this.time++;
				//if (i > 10) {
				//	var j = (i >>> 1);
				//	var v = this.value;
				//	keys[i] = keys[j];	
				//	keys[j] = key;
				//	var t = v[i];
				//	v[i] = v[j];	
				//	v[j] = t;
				//	return t;
				//}
				//else
				return this.value[i];
			}
		}
		return undefined;
	};
        WeakMap.prototype.has = function(key) {
		var keys = this.key, l = keys.length;
		for (var i = 0; i < l; i++) {
			if (keys[i] === key) {
				return true;
			}		
		}
		return false;
	};
	WeakMap.prototype.set = function(key,value) {
		this.value.push(value);
		this.key.push(key);
		//this.stamp.push(this.time++);
	};
}