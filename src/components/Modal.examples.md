# Modal组件使用示例

## 基础Modal组件

### 1. 简单的信息展示Modal

```tsx
import { Modal } from './Modal';

function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>显示信息</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="系统信息"
        size="md"
      >
        <p>这是一个信息展示的模态框。</p>
      </Modal>
    </>
  );
}
```

### 2. 表单Modal

```tsx
import { Modal } from './Modal';

function FormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 处理表单提交
    console.log(formData);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>编辑资料</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="编辑资料"
        size="lg"
        closeOnOverlayClick={false} // 防止误关闭
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
```

## ConfirmModal组件

### 1. 删除确认

```tsx
import { ConfirmModal } from './Modal';

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        删除
      </button>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onDelete}
        title="确认删除"
        message="确定要删除这个项目吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        confirmType="danger"
      />
    </>
  );
}
```

### 2. 保存确认

```tsx
import { ConfirmModal } from './Modal';

function SaveButton({ onSave }: { onSave: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
      >
        保存更改
      </button>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onSave}
        title="保存更改"
        message="确定要保存当前的更改吗？"
        confirmText="保存"
        cancelText="取消"
        confirmType="success"
      />
    </>
  );
}
```

### 3. 退出确认

```tsx
import { ConfirmModal } from './Modal';

function ExitButton({ onExit }: { onExit: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        退出编辑
      </button>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onExit}
        title="退出编辑"
        message="您有未保存的更改，确定要退出吗？"
        confirmText="退出"
        cancelText="继续编辑"
        confirmType="primary"
      />
    </>
  );
}
```

## 高级用法

### 1. 自定义样式的Modal

```tsx
import { Modal } from './Modal';

function CustomModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>自定义样式</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="自定义样式"
        size="xl"
        className="border-4 border-blue-500" // 自定义边框
        showCloseButton={false} // 隐藏关闭按钮
        closeOnOverlayClick={false} // 禁用点击外部关闭
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold">恭喜！</h2>
          <p>您已成功完成任务！</p>
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg"
          >
            太棒了！
          </button>
        </div>
      </Modal>
    </>
  );
}
```

### 2. 嵌套Modal

```tsx
import { Modal, ConfirmModal } from './Modal';

function NestedModal() {
  const [showMain, setShowMain] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    setShowConfirm(true); // 显示确认对话框
  };

  const confirmClose = () => {
    setShowMain(false);
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowMain(true)}>打开主对话框</button>
      
      <Modal
        isOpen={showMain}
        onClose={handleClose}
        title="主对话框"
        size="lg"
        closeOnOverlayClick={false}
      >
        <div className="space-y-4">
          <p>这是主对话框的内容。</p>
          <p>关闭时会弹出确认对话框。</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            关闭
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmClose}
        title="确认关闭"
        message="确定要关闭主对话框吗？"
        confirmText="确认"
        cancelText="取消"
        confirmType="primary"
      />
    </>
  );
}
```

## 组件特性

### Modal组件特性
- ✅ **响应式设计** - 支持sm、md、lg、xl四种尺寸
- ✅ **主题支持** - 自动适配深色/浅色主题
- ✅ **键盘支持** - ESC键关闭
- ✅ **背景滚动锁定** - 打开时禁止背景滚动
- ✅ **点击外部关闭** - 可配置是否支持
- ✅ **动画效果** - 平滑的打开/关闭动画
- ✅ **无障碍支持** - 正确的ARIA标签

### ConfirmModal组件特性
- ✅ **三种确认类型** - danger(红色)、primary(蓝色)、success(绿色)
- ✅ **自定义文本** - 可自定义标题、消息、按钮文本
- ✅ **自动关闭** - 确认后自动关闭
- ✅ **继承Modal特性** - 拥有Modal的所有特性

## 最佳实践

### 1. 状态管理
```tsx
// 推荐：使用单独的状态管理每个Modal
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);

// 不推荐：使用字符串管理多个Modal状态
const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null);
```

### 2. 表单处理
```tsx
// 推荐：在Modal内部处理表单状态
function EditModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };
  
  // 重置表单当Modal关闭时
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);
}
```

### 3. 性能优化
```tsx
// 推荐：使用条件渲染避免不必要的组件创建
{showModal && (
  <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
    <ExpensiveComponent />
  </Modal>
)}

// 或者依赖Modal内部的条件渲染
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <ExpensiveComponent />
</Modal>
```
