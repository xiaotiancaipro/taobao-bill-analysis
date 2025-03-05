# 淘宝账单分析，利润分析


## 一、介绍

该项目用于淘宝账单分析，可以方便的查看每年、每月、每日的利润。


## 二、使用教程

1. 构建 Docker 镜像并启动
   ```bash
   docker build -t taobao-bill-analysis .
   docker run -d -p 80:80 --name taobao-bill-analysis taobao-bill-analysis
   ```

2. 进入千牛将账单导出
   ![001](./img/readme/001.png)
   ![002](./img/readme/002.png)
   ![003](./img/readme/003.png)

3. 进入项目进行图表展示
   ![004](./img/readme/004.png)
   ![005](./img/readme/005.png)

