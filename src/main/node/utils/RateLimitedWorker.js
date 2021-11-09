let altQ = []
class RateLimitedWorker {
    
    constructor(interval, waitForInflight) {
        this.workInterval = interval;
        this.waitForInflight = waitForInflight
        
        this.workQueue = []
        this.inFlight = {}
        
        this.lastStepRuntime = Date.now();
    }

    step() {
        let now = Date.now();
        let execDelta = now - this.lastStepRuntime;
        this.lastStepRuntime = now;

        let headroom = Math.floor(execDelta / this.workInterval)
        let inFlight = Object.keys(this.inFlight).length;
        let queueSize = this.workQueue.length
        let spawnCount = headroom;
        if(this.waitForInflight) {
            spawnCount -= inFlight
        }

        console.log(`Exec Delta: ${execDelta} Headroom: ${headroom} SpawnCount: ${spawnCount} InFlight: ${inFlight} QueueSiz: ${queueSize}`)
        
        while( spawnCount > 0 && this.workQueue.length > 0 ) {
            spawnCount--;
            let work = this.workQueue.shift();
            this.inFlight[work] = true
            this.doWorkUnit(work);
        }
        
        if(this.workQueue.length > 0){
            this.scheduleStep();
        } else {
            console.log("Executor going to sleep until next work comes in");
        }
    }

    scheduleStep(override) {
        //wonder if this is gonna create a linked list style mem leak?
        let interval = (override || this.workInterval);
        console.log(`Scheduling next step inExecutor ${interval}`)
        setTimeout(() => {
            this.step()
        }, interval)
    }

    doWorkUnit(workUnit) {
        let start = Date.now();
        let context = this;
        Promise
        .resolve(workUnit.work.apply(workUnit.context))
        .then(result => {
            let end = Date.now();
            delete context.inFlight[workUnit]
            console.log(`Work carried out after ${end - start}ms`)
            workUnit.resolve(result);
        })
        .catch(ex => {
            let end = Date.now();
            delete context.inFlight[workUnit]
            console.log(`Work failed after ${end - start}ms`)
            workUnit.reject(ex);
        })
    }

    /*
    Returns: a promise for the work unit
    */
    submit(workUnit, context) {
        console.log(`Work submitted to Executor(${this.workInterval})`)
        let promiseCtl = {}
        let promise = new Promise(function(resolve, reject){
            promiseCtl['resolve'] = resolve;
            promiseCtl['reject'] = reject;
            promiseCtl['context'] = context;
            promiseCtl['work'] = workUnit;
        });

        this.workQueue.push(promiseCtl);
        //if the queue was empty then the executor might be sleeping, wake it up
        if (this.workQueue.length == 1) {
            this.step();
        }
    
        return promise
    }   
}

module.exports = RateLimitedWorker