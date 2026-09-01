/* English with Mariami — curriculum consistency validator
   Safe diagnostic layer only.
   Does not modify lessons, progress, auth, Supabase, or PWA behavior.
*/
(function(){
  'use strict';

  window.ENGLISH_MARIAMI_CURRICULUM_VALIDATION = {
    version: '1.0.0',

    validateMap: function(map, expectedCount, grade){
      var result = {
        grade: grade,
        ok: true,
        errors: [],
        warnings: [],
        count: Array.isArray(map) ? map.length : 0,
        expectedCount: expectedCount
      };

      if(!Array.isArray(map)){
        result.ok = false;
        result.errors.push('Curriculum map is missing or is not an array.');
        return result;
      }

      if(map.length !== expectedCount){
        result.ok = false;
        result.errors.push('Expected '+expectedCount+' entries but found '+map.length+'.');
      }

      var ids = {};
      map.forEach(function(item, index){
        if(!item || typeof item !== 'object'){
          result.ok = false;
          result.errors.push('Entry '+index+' is invalid.');
          return;
        }

        if(!Number.isInteger(item.id)){
          result.ok = false;
          result.errors.push('Entry '+index+' has an invalid id.');
        }else if(ids[item.id]){
          result.ok = false;
          result.errors.push('Duplicate id '+item.id+'.');
        }else{
          ids[item.id] = true;
        }

        ['key','title','goal','practice'].forEach(function(field){
          if(!String(item[field] || '').trim()){
            result.warnings.push('Entry '+(item.id || index)+' is missing '+field+'.');
          }
        });
      });

      return result;
    },

    run: function(){
      var reports = [];

      if(window.GRADE2_CURRICULUM_MAP){
        reports.push(this.validateMap(window.GRADE2_CURRICULUM_MAP,12,2));
      }
      if(window.GRADE3_CURRICULUM_MAP){
        reports.push(this.validateMap(window.GRADE3_CURRICULUM_MAP,24,3));
      }
      if(window.GRADE4_CURRICULUM_MAP){
        reports.push(this.validateMap(window.GRADE4_CURRICULUM_MAP,24,4));
      }

      return reports;
    }
  };
})();
