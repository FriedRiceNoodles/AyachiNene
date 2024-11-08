import si from "systeminformation";

// 获取简洁的系统总计和各模块荷载信息
export async function getSystemSummary() {
  const cpu = await si.cpu();
  const memory = await si.mem();
  const os = await si.osInfo();
  const load = await si.currentLoad();
  const disk = await si.fsSize();

  // 内存负载
  const memoryLoad = (memory.used / memory.total) * 100;

  // 磁盘负载（以第一个磁盘为例）
  const diskUsed = (disk[0]?.use / 100) * 100;

  const result = `
--- 系统总计 ---
CPU: ${cpu.model}
核心数: ${cpu.cores}
总内存: ${(memory.total / 1024 ** 3).toFixed(2)} GB
已用内存: ${(memory.used / 1024 ** 3).toFixed(2)} GB
平台: ${os.platform} ${os.distro} ${os.release}

--- 系统荷载 ---
CPU 当前负载: ${load.currentLoad.toFixed(2)}%
CPU 平均负载（1分钟）: ${load.avgLoad[0]?.toFixed(2)}%
内存使用负载: ${memoryLoad.toFixed(2)}%
磁盘使用负载: ${diskUsed.toFixed(2)}%
`;
  return result;
}

// 执行并显示简洁信息
getSystemSummary().catch(console.error);
