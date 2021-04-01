<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.created_at"
        size="small"
        type="datetimerange"
        range-separator="-"
        start-placeholder="上市日期"
        end-placeholder="截至日期"
        value-format="yyyyMMdd"
        class="filter-item"
        :editable="false"
      />
      <el-select
        v-model="listQuery.industry"
        size="small"
        placeholder="选择行业"
        clearable
        class="filter-item"
        :data="industries"
      >
        <el-option v-for="(item) in industries" :label="item" :value="item" />
      </el-select>
      <el-input
        v-model="listQuery.keyword"
        size="small"
        placeholder="请输入关键词"
        clearable
        class="filter-item w-200"
      />
      <el-button-group class="filter-item">
        <el-button
          size="small"
          type="primary"
          icon="el-icon-search"
          @click="search"
        >
          搜索
        </el-button>
        <el-button
          size="small"
          type="primary"
          icon="el-icon-refresh"
          @click="refresh"
        >
          重置
        </el-button>
        </el-button>
      </el-button-group>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      height="100%"
      class="table-container"
      highlight-current-row
    >
      <el-table-column
        fixed
        label="Code"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tsb.ts_code'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="名称"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tsb.name'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="所属行业"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tsb.industry'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="地区"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tsb.area'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="市盈率"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tdb.pe'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="市净率"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tdb.pb'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="换手率"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tdb.turnover_rate'] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="流通股本(亿股)"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tdb.float_share'] | numFilter}}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="总股本(亿股)"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tdb.total_share'] | numFilter}}
        </template>
      </el-table-column>
      <el-table-column
        fixed
        label="上市日期"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row['tsb.list_date'] }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="fetchData"
    />

    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType === 'modify' ? '修改' : '新增'"
    >
      <el-form
        ref="dataForm"
        :model="temp"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="名称">
          <el-input v-model="temp.title" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="temp.link" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="temp.status">
            <el-radio :label="0">禁用</el-radio>
            <el-radio :label="1">正常</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="text-right">
        <el-button type="danger" @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submit">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getList } from '@/api/stock'
import { deepClone } from '@/utils'

const _temp = {
  id: '',
  title: '',
  icon: '',
  link: '',
  status: 1
}

export default {
  components: {
    Pagination
  },
  filters: {
    numFilter(value) {
      // 截取当前数据到小数点后两位
      let realVal = (Number(value)/10000).toFixed(2)
      // num.toFixed(2)获取的是字符串
      return Number(realVal)
    }
  },
  data() {
    return {
      total: 0,
      list: [],
      industries: [],
      menus: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined
      },
      uploadUrl: '',
      temp: Object.assign({}, _temp),
      dialogVisible: false,
      dialogType: 'create',
      loading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.temp.site_logo = URL.createObjectURL(file.raw)
    },
    search() {
      this.fetchData()
    },
    refresh() {
      this.listQuery = {
        page: 1,
        limit: 20,
        keyword: undefined
      }
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.industries = response.data.industries
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = Object.assign({}, _temp)
    },
    add() {
      this.resetTemp()
      this.dialogVisible = true
      this.dialogType = 'create'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    edit(scope) {
      this.resetTemp()
      this.dialogVisible = true
      this.dialogType = 'modify'
      this.temp = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    changeStatus(value, scope) {
      setTimeout(() => {
        this.list[scope.$index].status = value
        this.$message({
          message: '更新成功',
          type: 'success'
        })
      }, 300)
    },
    del(scope) {
      this.$confirm('确认删除该条数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          this.list.splice(scope.$index, 1)
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        }, 300)
      })
    },
    submit() {
      if (this.loading) {
        return
      }
      this.loading = true
      setTimeout(() => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        this.dialogVisible = false
        this.loading = false
      }, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-upload {
  border: 1px dashed #d9d9d9 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  .el-icon-plus.avatar-uploader-icon {
    border: 1px dashed #d9d9d9 !important;
    border-radius: 6px;
    font-size: 28px;
    color: #8c939d;
    width: 128px;
    height: 128px;
    line-height: 128px;
    text-align: center;
  }
}
.avatar-uploader {
  height: 128px;

  img {
    width: 128px;
    height: 128px;
  }
}
</style>
