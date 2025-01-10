<template>
    <div class="DataTable" shadow="never">
        <div class="scroll-wrapper" />
        <el-table
            ref="table"
            border
            :data="items"
            :default-sort="defaultSort || {}"
            empty-text="No data"
            :max-height="tableHeight ?? null"
            @sort-change="sortChange"
            @selection-change="handleSelectionChange"
            @row-click="rowClick"
            :lazy="true"
            :reserve-selection="true"
            :row-key="rowKey"
        >
            <el-table-column v-if="enableExpand" type="expand" width="50">
                <template #default="scope">
                    <slot name="expand" v-bind="scope">
                        {{ scope.row }}
                    </slot>
                </template>
            </el-table-column>
            <el-table-column v-if="enableSelectBox" type="selection" width="55" :reserve-selection="true" />
            <el-table-column v-if="enableIndex" type="index" fixed width="70" label="No." align="center" />
            <el-table-column
                v-for="(field, index) in fields"
                :index="index"
                :key="index"
                :fixed="field.fixed"
                :prop="field.key"
                :sortable="field.sortable || false"
                :label="field.label"
                :align="field.align || `left`"
                :header-align="field.headerAlign || `left`"
                :width="field.width || 'auto'"
                :min-width="field.minWidth || 'auto'"
                :label-class-name="field.lableClassName || `left`"
            >
                <!-- Pass on all scoped slots -->
                <template #default="scope">
                    <slot :name="field.key" v-bind="scope">
                        {{ scope.row[field.key] }}
                    </slot>
                </template>
            </el-table-column>

            <!-- Pass on all named slots -->
            <slot v-for="slot in Object.keys($slots)" :slot-scope="slot" :name="slot" />
            <template #empty>
                <el-empty description="No data" />
            </template>
        </el-table>
        <slot v-if="paginate && items.length" name="after">
            <div
                v-if="!disablePaginateFooter"
                class="card-footer" :class="{ 'card-footer--center': footerCenter }"
            >
                <div class="table-pagination flex justify-end items-end">
                    <div v-if="!disableTableInfo && paging.from && paging.to" class="flex items-center">
                        <div class="table-showing whitespace-nowrap">
                            <span class="text-[#646464] text-sm">
                                {{ `${paging.from}-${paging.to} ${$t('paginate.of')} ${paging.total} ${$t('paginate.items')}` }}
                            </span>
                        </div>
                        <el-select
                            v-model="paging.per_page"
                            @change="handleSizeChange"
                            class="min-w-[55px] select-option"
                            :suffix-icon="getCaretBottom"
                        >
                            <el-option
                                v-for="(item, index) in pageSizesOpt"
                                :key="index" :label="item" :value="item"
                            />
                        </el-select>
                    </div>
                    <div class="flex justify-end items-center w-[100%]">
                        <button
                            :disabled="paging.current_page == 1"
                            class="h-[32px] px-[8px] border-[1px] border-[#DCDFE6] rounded-l-[4px] text-[14px]"
                            :class="{'cursor-not-allowed opacity-50' : paging.current_page == 1}"
                            @click="handleCurrentChange(1)"
                        >
                            {{$t('paginate.first')}}
                        </button>
                        <div>
                            <el-pagination
                                v-model:page-size="pageSize"
                                :current-page="Number(paging.current_page) || 1"
                                :page-sizes="pageSizesOpt"
                                :pager-count="pagerCount"
                                layout="->, prev, pager, next"
                                :total="paging.total"
                                :background="paginateBackground"
                                :prev-icon="getDArrowLeft"
                                :next-icon="getDArrowRight"
                                @current-change="handleCurrentChange"
                                @size-change="handleSizeChange"
                            />
                        </div>
                        <button
                            :disabled="paging.current_page == paging.last_page"
                            class="h-[32px] px-[8px] border-[1px] border-[#DCDFE6] rounded-r-[4px] text-[14px]"
                            :class="{'cursor-not-allowed opacity-50' : paging.current_page == paging.last_page}"
                            @click="handleCurrentChange(paging.last_page)"
                        >
                            {{$t('paginate.last')}}
                        </button>
                    </div>
                </div>
            </div>
        </slot>
    </div>
</template>

<script>
import {DArrowLeft, DArrowRight, CaretBottom} from '@element-plus/icons-vue'

const pageSizesOpt = [5, 10, 20, 50, 100]

export default {
    props: {
        fields: {type: Array, default: () => []},
        items: {type: Array, default: () => []},
        paginate: {
            type: Object, default: () => {
            }
        },
        enableIndex: {type: Boolean, default: false},
        enableSelectBox: {type: Boolean, default: false},
        enableExpand: {type: Boolean, default: false},
        disableTableInfo: {type: Boolean, default: false},
        disablePaginateFooter: {type: Boolean, default: false},
        headerCenter: {type: Boolean, default: false},
        footerCenter: {type: Boolean, default: false},
        paginateBackground: {type: Boolean, default: true},
        defaultSort: {
            type: Object, default: () => {
            }
        },
        tableHeight: {type: Number, default: 700},
        pagerCount: {type: Number},
        rowKey: {type: String, default: 'id'},
    },
    emits: ['row-selected', 'page-change', 'size-change', 'sort-change', 'row-click'],
    data() {
        return {
            pageSizesOpt,
            pageSize: Number(this?.$route?.params?.limit || pageSizesOpt[0]),
        }
    },
    computed: {
        paging() {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.pageSize = Number(this.paginate.per_page || pageSizesOpt[0])
            return this.paginate
        },
        getDArrowRight() {
            return DArrowRight
        },
        getDArrowLeft() {
            return DArrowLeft
        },
        getCaretBottom() {
            return CaretBottom;
        }
    },
    mounted() {
        let triggerScroll = null
        this.$nextTick(() => {
            this.upClassDataTable()

            const tableEl = this.$el.querySelector('.el-scrollbar__view')
            const element = this.$el.querySelector('.el-table__body')

            if (this.$el.querySelector('.is-scrolling-none') == null) {
                const table = this.$el.querySelector('.el-table')

                const tableWidth = table.offsetWidth ? table.offsetWidth + 'px' : table.style.width
                this.$el.querySelector('.scroll-wrapper').style.width = tableWidth

                this.$el.querySelector('.scroll-wrapper').addEventListener('scroll', (event) => {
                    // prevent infinite trigger scroll
                    if (triggerScroll !== 'table') {
                        triggerScroll = 'top'
                        this.scrollTable(event.currentTarget.scrollLeft)
                    } else {
                        triggerScroll = null
                    }
                })

                this.$el.querySelector('.el-scrollbar__wrap').addEventListener('scroll', (event) => {
                    // prevent infinite trigger scroll
                    if (triggerScroll !== 'table') {
                        triggerScroll = 'top'
                        this.scrollTable(tableEl.scrollLeft)
                    } else {
                        triggerScroll = null
                        this.scrollTable(tableEl.scrollLeft)
                    }
                })

                tableEl.addEventListener('scroll', (event) => {
                    // prevent infinite trigger scroll
                    if (triggerScroll !== 'top') {
                        triggerScroll = 'table'
                        this.scrollTop(event.currentTarget.scrollLeft)
                        // check add class scroll-left or right
                        const scrollbarWidth = element.offsetWidth - table.offsetWidth
                        if (event.currentTarget.scrollLeft < scrollbarWidth / 2) {
                            table.classList.remove('is-scrolling-right')
                            table.classList.add('is-scrolling-left')
                        } else {
                            table.classList.remove('is-scrolling-left')
                            table.classList.add('is-scrolling-right')
                        }
                    } else {
                        triggerScroll = null
                    }
                })
            }
            let isDown = false
            let startX
            let scrollLeft = 0
            let startY
            let scrollTop = 0
            element.addEventListener('mousedown', (e) => {
                isDown = true
                element.classList.add('active')
                startX = e.pageX - element.offsetLeft
                startY = e.pageY - element.offsetTop
                scrollLeft = tableEl.scrollLeft
                scrollTop = tableEl.scrollTop
            })
            const moveListener = (e) => {
                if (!isDown) return
                e.preventDefault()
                const x = e.pageX - element.offsetLeft
                const y = e.pageY - element.offsetTop
                const walkX = (x - startX) * 3
                const walkY = (y - startY) * 3
                if (walkX !== 0) {
                    tableEl.scrollLeft = scrollLeft - walkX
                }
                if (walkY !== 0) {
                    tableEl.scrollTop = scrollTop - walkY
                }
            }
            element.addEventListener('mousemove', moveListener)
            const upListener = () => {
                isDown = false
                element.classList.remove('active')
            }
            element.addEventListener('mouseup', upListener)
            element.addEventListener('mouseleave', upListener)
        })
    },
    methods: {
        toggleSelection(rows) {
            if (rows) {
                rows.forEach((row) => {
                    this.$refs.table.toggleRowSelection(row)
                })
            } else {
                this.$refs.table.clearSelection()
            }
        },
        handleSelectionChange(selectedItems) {
            this.$emit('row-selected', selectedItems)
        },
        rowClick(row) {
            this.$emit('row-click', row);
        },
        handleCurrentChange(value) {
            this.$emit('page-change', value)
            this.upClassDataTable()
        },
        handleSizeChange(value) {
            this.$emit('size-change', value)
            this.paginate.current_page = 1
            this.upClassDataTable()
        },
        scrollTop(val) {
            this.$el.querySelector('.el-table__header-wrapper').scrollLeft = val
        },
        scrollTable(val) {
            this.$el.querySelector('.el-table__header-wrapper').scrollLeft = val
        },
        sortChange(column) {
            this.$emit('sort-change', column)
        },
        upClassDataTable() {
            setTimeout(() => {
                const updateClassCss = () => {
                    const table = this.$el.querySelector('.el-table')
                    if (table) {
                        table.classList.remove('is-scrolling-right')
                        table.classList.add('is-scrolling-left')
                        clearInterval(interval)
                    }
                }
                const interval = setInterval(updateClassCss)
            }, 500)
        },
    },
}
</script>
